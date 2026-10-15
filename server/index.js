import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// MEMBACA FILE .env
function loadLocalEnv() {
  const envPath = path.join(ROOT, ".env");

  if (!fs.existsSync(envPath)) return;

  const contents = fs.readFileSync(envPath, "utf8");

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

// KONFIGURASI SERVER DAN GEMINI
function hasUsableApiKey() {
  const key = (process.env.GEMINI_API_KEY || "").trim();

  if (!key) return false;

  const normalized = key.toLowerCase();

  const placeholders = [
    "api_key",
    "your_api_key",
    "your_gemini_api_key",
    "masukkan_api_key_di_sini",
    "ganti_dengan_api_key",
    "paste_api_key_here",
    "isi_api_key",
  ];

  return !placeholders.some((placeholder) => normalized.includes(placeholder));
}

const PORT = Number(process.env.PORT || process.env.API_PORT || 3001);

const MODEL = (process.env.GEMINI_MODEL || "gemini-3.8-flash").replace(
  /^models\//,
  "",
);

const FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash-lite"];

const MAX_BODY_BYTES = 24 * 1024;
const MAX_TEXT = 1200;
const REQUEST_TIMEOUT_MS = 30_000;

const rateLimits = new Map();

// KONTEKS KASUS TEMUKANTERSANGKA
const CASE_CONTEXT = `
Kamu adalah AI pendamping untuk permainan misteri fiktif
TemukanTersangka, kasus MM-001: Pembunuhan Tengah Malam
di Kediaman Blackwood.

Korban ditemukan tewas di ruang kerja yang terkunci
sekitar pukul 23.30 WIB. Semua karakter dan kejadian
dalam kasus ini adalah fiksi.

TIGA TERSANGKA:

1. Victoria Blackwood, istri korban.
Mengaku berada di sayap timur sejak pukul 22.45.
Ia dan korban bertengkar tentang urusan keuangan.
Ia mendengar suara dari ruang kerja.

2. Edward Hayes, mitra bisnis.
Mengaku datang untuk urusan bisnis dan menyatakan
meninggalkan kediaman sebelum pukul 23.00.
Namun, keluar dari ruang tamu tidak berarti ia langsung
meninggalkan seluruh kediaman. Ada halaman buku besar
atau catatan keuangan yang hilang.

3. Arthur Wells, kepala pelayan.
Mengaku menyiapkan dan mengantar teh sekitar pukul 23.12,
kemudian kembali ke ruang servis. Kunci cadangan ruang
kerja tidak berada di tempat biasanya. Arthur memiliki
akses ke area servis.

BARANG BUKTI:

B-01: Cangkir teh korban. Minuman terakhir yang diketahui
dikonsumsi korban. Belum ada hasil laboratorium yang
membuktikan adanya racun.

B-02: Jadwal pelayanan yang menempatkan Arthur mengantar
teh sekitar pukul 23.12.

B-03: Halaman buku besar yang hilang. Hal ini menunjukkan
kemungkinan persoalan keuangan, tetapi belum membuktikan
siapa yang mengambil halaman tersebut.

B-04: Kunci cadangan yang tidak berada di lemari
penyimpanan biasanya. Staf servis lain mungkin juga
memiliki akses.

Kebenaran resmi skenario: Arthur Wells adalah pelaku.

Jangan langsung membocorkan solusi ketika interogasi biasa.
Jangan menciptakan bukti fisik baru, hasil forensik,
saksi, atau fakta yang tidak tercantum dalam skenario.

Jika informasi belum cukup, katakan bahwa informasi
tersebut belum diketahui. Bedakan fakta, dugaan,
dan pertanyaan yang masih terbuka.

Gunakan bahasa Indonesia dengan suasana drama detektif
yang serius.
`;

// UTILITAS HTTP
function sendJson(res, status, payload) {
  if (res.writableEnded || res.destroyed) return;

  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });

  res.end(JSON.stringify(payload));
}

function readJson(req) {
  // Vercel Node.js Functions may provide an already-parsed body.
  if (
    req.body !== undefined &&
    req.body !== null &&
    typeof req.body === "object"
  ) {
    return Promise.resolve(req.body);
  }

  if (typeof req.body === "string") {
    try {
      return Promise.resolve(JSON.parse(req.body || "{}"));
    } catch {
      return Promise.reject(
        Object.assign(new Error("Format permintaan tidak valid."), {
          statusCode: 400,
        }),
      );
    }
  }

  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    let finished = false;

    req.on("data", (chunk) => {
      if (finished) return;

      size += chunk.length;

      if (size > MAX_BODY_BYTES) {
        finished = true;

        reject(
          Object.assign(new Error("Permintaan terlalu besar."), {
            statusCode: 413,
          }),
        );

        req.resume();
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => {
      if (finished) return;

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(
          Object.assign(new Error("Format permintaan tidak valid."), {
            statusCode: 400,
          }),
        );
      }
    });

    req.on("error", (error) => {
      if (!finished) reject(error);
    });
  });
}

function allowedByRateLimit(req) {
  const ip = req.socket.remoteAddress || "unknown";
  const now = Date.now();

  const current = rateLimits.get(ip) || {
    start: now,
    count: 0,
  };

  if (now - current.start > 60_000) {
    current.start = now;
    current.count = 0;
  }

  current.count += 1;
  rateLimits.set(ip, current);

  return current.count <= 20;
}

function safeText(value, max = MAX_TEXT) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function konteksKasusPublik(raw) {
  if (!raw || typeof raw !== "object") return CASE_CONTEXT;
  const judul = safeText(raw.judul, 120);
  const deskripsi = safeText(raw.deskripsi, 1200);
  const tersangka = Array.isArray(raw.tersangka)
    ? raw.tersangka.slice(0, 5)
    : [];
  const bukti = Array.isArray(raw.bukti) ? raw.bukti.slice(0, 8) : [];
  if (!judul || tersangka.length < 3) return CASE_CONTEXT;
  return `
Kasus aktif TemukanTersangka: ${judul}.
Laporan kasus: ${deskripsi}
Tersangka yang diketahui publik:
${tersangka.map((x) => `- ${safeText(x.nama, 100)} (${safeText(x.peran, 100)}): ${safeText(x.alibi, 400)}; pernyataan: ${safeText(x.pernyataan, 400)}`).join("\n")}
Barang bukti yang ditemukan:
${bukti.map((x) => `- ${safeText(x.id, 30)} ${safeText(x.nama, 120)}: ${safeText(x.detail, 500)}`).join("\n")}
Gunakan hanya informasi kasus ini. Jangan mengganti identitas atau fakta tersangka. Jangan mengungkap pelaku kecuali pemain mengajukan kesimpulan akhir melalui sistem permainan.
`;
}

function normalisasiKasusAI(raw, mode, tema, kesulitan, jumlahTersangka) {
  if (
    !raw ||
    typeof raw !== "object" ||
    !raw.kasus ||
    !Array.isArray(raw.tersangka) ||
    !Array.isArray(raw.barangBukti) ||
    !Array.isArray(raw.pertanyaanInterogasi) ||
    !raw.solusiRahasia
  )
    throw new Error("Struktur kasus AI tidak lengkap.");
  const suspects = raw.tersangka;
  const evidence = raw.barangBukti;
  if (
    suspects.length !== jumlahTersangka ||
    suspects.length < 3 ||
    suspects.length > 5
  )
    throw new Error("Jumlah tersangka tidak sesuai permintaan.");
  if (evidence.length < 4 || evidence.length > 8)
    throw new Error("Kasus harus memiliki 4–8 barang bukti.");
  const ids = new Set(suspects.map((x) => x?.id));
  const evidenceIds = new Set(evidence.map((x) => x?.id));
  if (
    ids.size !== suspects.length ||
    [...ids].some((x) => typeof x !== "string" || !x)
  )
    throw new Error("ID tersangka duplikat atau tidak valid.");
  if (
    evidenceIds.size !== evidence.length ||
    [...evidenceIds].some((x) => typeof x !== "string" || !x)
  )
    throw new Error("ID bukti duplikat atau tidak valid.");
  if (!ids.has(raw.solusiRahasia.pelakuId))
    throw new Error("Pelaku resmi tidak ditemukan di daftar tersangka.");
  if (
    !Array.isArray(raw.solusiRahasia.buktiPenentu) ||
    !raw.solusiRahasia.buktiPenentu.some((x) => evidenceIds.has(x))
  )
    throw new Error("Solusi harus menyertakan bukti penentu yang valid.");
  if (
    raw.pertanyaanInterogasi.length !== suspects.length ||
    raw.pertanyaanInterogasi.some(
      (q) => !Array.isArray(q) || q.length < 2 || q.length > 4,
    )
  )
    throw new Error("Pertanyaan interogasi belum lengkap.");
  const text = (v, max = 1000) => {
    if (typeof v !== "string" || !v.trim())
      throw new Error("Ada bagian kasus yang kosong.");
    return v.trim().slice(0, max);
  };
  const colors = ["merah", "emas", "abu", "biru", "hijau"];
  const tentukanGender = (x) => {
    const eksplisit = String(x?.jenisKelamin || x?.gender || x?.kelamin || "")
      .toLowerCase()
      .trim();
    if (
      [
        "perempuan",
        "wanita",
        "female",
        "women",
        "woman",
        "cewek",
        "putri",
      ].includes(eksplisit)
    )
      return "perempuan";
    if (
      [
        "laki-laki",
        "laki laki",
        "pria",
        "male",
        "men",
        "man",
        "cowok",
        "putra",
      ].includes(eksplisit)
    )
      return "laki-laki";
    const konteks = [
      x?.nama,
      x?.peran,
      x?.deskripsi,
      x?.alibi,
      x?.pernyataan,
      x?.catatan,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (
      /\b(perempuan|wanita|ibu|nyonya|nona|mbak|saudari|putri|istri|janda|\bshe\b|\bher\b|female|woman)\b/.test(
        konteks,
      )
    )
      return "perempuan";
    if (
      /\b(laki-laki|pria|bapak|pak|mas|saudara|putra|suami|duda|\bhe\b|\bhim\b|male|man)\b/.test(
        konteks,
      )
    )
      return "laki-laki";
    const nama = String(x?.nama || "")
      .toLowerCase()
      .trim();
    if (
      /^(siti|dewi|putri|ayu|indah|ratna|lestari|fitri|nurul|melati|kartika|rina|nina|sarah|amelia|anisa|annisa|maya|citra|wulan|tiara|intan|bella|nadia|aisyah|farah|linda|susanti|yuni|mega|rani|dian)\b/.test(
        nama,
      )
    )
      return "perempuan";
    if (
      /^(budi|andi|agus|dedi|joko|bambang|rizky|rizki|arif|fajar|rahmat|yusuf|ahmad|adi|eko|dimas|putra|surya|irfan|reza|bayu|wahyu|tono|hendra|ferdi|ferry|doni|rudi|ilham|galih|bagas|rio|yoga|aldi|ivan)\b/.test(
        nama,
      )
    )
      return "laki-laki";
    return "laki-laki";
  };
  const nomorFoto = (nama) => {
    let hash = 0;
    for (const char of String(nama || "TT"))
      hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return (hash % 99) + 1;
  };
  const tersangka = suspects.map((x, i) => {
    const jenisKelamin = tentukanGender(x);
    const nama = text(x.nama, 100);
    return {
      id: x.id,
      nama,
      peran: text(x.peran, 100),
      jenisKelamin,
      inisial: text(
        x.inisial ||
          String(x.nama || "TT")
            .slice(0, 2)
            .toUpperCase(),
        4,
      ),
      foto: `https://randomuser.me/api/portraits/${jenisKelamin === "perempuan" ? "women" : "men"}/${nomorFoto(nama)}.jpg`,
      warna: colors[i % colors.length],
      deskripsi: text(x.deskripsi, 500),
      alibi: text(x.alibi, 500),
      pernyataan: text(x.pernyataan, 700),
      catatan: text(x.catatan, 700),
    };
  });
  const barangBukti = evidence.map((x) => ({
    id: x.id,
    nama: text(x.nama, 120),
    kategori: text(x.kategori || "PETUNJUK", 60),
    lokasi: text(x.lokasi, 120),
    ikon: safeText(x.ikon, 8) || "▤",
    ringkasan: text(x.ringkasan, 300),
    detail: text(x.detail, 900),
    petunjuk: text(x.petunjuk, 500),
  }));
  const pertanyaanInterogasi = raw.pertanyaanInterogasi.map((list, i) =>
    list.map((q, j) => ({
      id: `s${i + 1}-${safeText(q.id, 35) || `q${j + 1}`}`,
      pertanyaan: text(q.pertanyaan, 300),
      jawaban: text(q.jawaban, 500),
      catatan: text(q.catatan, 500),
    })),
  );
  const pelaku = tersangka.find((x) => x.id === raw.solusiRahasia.pelakuId);
  return {
    id: `AI-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    isGenerated: true,
    dibuatPada: new Date().toISOString(),
    mode,
    kasus: {
      id: "AI",
      judul: text(raw.kasus.judul, 120),
      tema: text(raw.kasus.tema || tema, 60),
      lokasi: text(raw.kasus.lokasi, 150),
      waktu: text(raw.kasus.waktu, 80),
      kesulitan: text(raw.kasus.kesulitan || kesulitan, 30).toUpperCase(),
      deskripsi: text(raw.kasus.deskripsi, 1200),
      tujuan: text(raw.kasus.tujuan, 500),
      tersangka,
    },
    barangBukti,
    wawancaraTersangka: tersangka,
    pertanyaanInterogasi,
    hubunganBukti:
      raw.hubunganBukti && typeof raw.hubunganBukti === "object"
        ? raw.hubunganBukti
        : {},
    solusiRahasia: {
      pelakuId: pelaku.id,
      motif: text(raw.solusiRahasia.motif, 1000),
      kronologi: text(raw.solusiRahasia.kronologi, 1200),
      buktiPenentu: raw.solusiRahasia.buktiPenentu.filter((x) =>
        evidenceIds.has(x),
      ),
    },
  };
}

// MEMBANGUN PERMINTAAN AI
function buildRequest(body) {
  const caseContext = konteksKasusPublik(body.caseContext);
  const mode =
    body.mode === "analyze"
      ? "analyze"
      : body.mode === "interrogate"
        ? "interrogate"
        : "";

  if (!mode) {
    throw Object.assign(new Error("Mode AI tidak dikenal."), {
      statusCode: 400,
    });
  }

  //  MODE INTEROGASI TERSANGKA
  if (mode === "interrogate") {
    const suspectName = safeText(body.suspectName, 100);
    const question = safeText(body.question);

    const validSuspects = Array.isArray(body.caseContext?.tersangka)
      ? body.caseContext.tersangka
          .map((x) => safeText(x?.nama, 100))
          .filter(Boolean)
      : ["Victoria Blackwood", "Edward Hayes", "Arthur Wells"];

    if (!validSuspects.includes(suspectName)) {
      throw Object.assign(new Error("Tersangka tidak valid."), {
        statusCode: 400,
      });
    }

    if (!question) {
      throw Object.assign(new Error("Tulis pertanyaan terlebih dahulu."), {
        statusCode: 400,
      });
    }

    const evidence = Array.isArray(body.evidence)
      ? body.evidence.slice(0, 4)
      : [];

    const notes = safeText(body.notes, 2500);

    const history = Array.isArray(body.history)
      ? body.history
          .slice(-8)
          .map((item) => ({
            role: item?.role === "model" ? "model" : "user",
            parts: [
              {
                text: safeText(item?.text, MAX_TEXT),
              },
            ],
          }))
          .filter((item) => item.parts[0].text)
      : [];

    const instruction = `
${caseContext}

MODE: INTEROGASI.

Kamu sedang memerankan ${suspectName}, bukan narator.

Jawab langsung pertanyaan pemain sesuai karakter
dan informasi yang diketahui oleh tersangka tersebut.

Jangan mengaku mengetahui bukti yang belum diperlihatkan
kepadamu. Jika pemain menyebut bukti, tanggapi secara
masuk akal berdasarkan karakter dan fakta kasus.

Jangan mengungkap solusi secara spontan. Jika bukti yang
diajukan cukup menekan, jawaban boleh menunjukkan
keraguan atau kontradiksi kecil yang sesuai skenario.

Jawab dengan lengkap dalam sekitar 2-5 kalimat.
Jangan berhenti di tengah kalimat dan jangan menggunakan
format JSON.

Bukti yang telah ditemukan pemain:
${JSON.stringify(evidence)}

Catatan penyelidik:
${notes || "(belum ada)"}
`;

    return {
      systemInstruction: {
        parts: [{ text: instruction }],
      },

      contents: [
        ...history,
        {
          role: "user",
          parts: [{ text: question }],
        },
      ],

      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 4096,
      },
    };
  }

  // MODE ANALISIS BARANG BUKTI
  const evidence = Array.isArray(body.evidence)
    ? body.evidence.slice(0, 4)
    : [];

  if (evidence.length === 0) {
    throw Object.assign(new Error("Periksa barang bukti terlebih dahulu."), {
      statusCode: 400,
    });
  }

  const suspects = Array.isArray(body.suspects)
    ? body.suspects.slice(0, 3)
    : [];

  const notes = safeText(body.notes, 2500);

  const selectedEvidence = Array.isArray(body.selectedEvidence)
    ? body.selectedEvidence.slice(0, 2)
    : [];

  const instruction = `
${caseContext}

MODE: ANALISIS BUKTI.

Bertindaklah sebagai analis kasus profesional.

Gunakan hanya informasi yang diberikan dan fakta resmi
skenario. Susun jawaban dalam bahasa Indonesia dengan
bagian berikut:

1. Fakta yang didukung.
2. Hubungan yang mungkin.
3. Hal yang belum terbukti.
4. Langkah penyelidikan berikutnya.

Jangan mengklaim cangkir mengandung racun karena belum
ada hasil laboratorium. Jangan menganggap seseorang
bersalah hanya karena memiliki akses atau kesempatan.

Berikan analisis yang lengkap, jelas, logis, dan tidak
memberikan kepastian yang melampaui bukti.
Akhiri dengan kalimat yang utuh.
`;

  return {
    systemInstruction: {
      parts: [{ text: instruction }],
    },

    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
Analisis bukti yang ditemukan:
${JSON.stringify(evidence)}

Profil atau keterangan tersangka:
${JSON.stringify(suspects)}

Pasangan bukti yang ingin dibandingkan:
${JSON.stringify(selectedEvidence)}

Catatan penyelidik:
${notes || "(belum ada)"}

Buat analisis berdasarkan data ini.
`,
          },
        ],
      },
    ],

    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 8192,
    },
  };
}

// MEMANGGIL AI DENGAN RETRY DAN MODEL CADANGAN
async function callGemini(requestBody) {
  const models = [...new Set([MODEL, ...FALLBACK_MODELS])];

  const retryableStatuses = new Set([408, 429, 500, 502, 503, 504]);

  let lastResult = null;
  let lastNetworkError = null;

  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const model = models[modelIndex];

    // Model utama dicoba dua kali, Setiap model cadangan dicoba sekali.
    const attempts = modelIndex === 0 ? 2 : 1;

    for (let attempt = 0; attempt < attempts; attempt++) {
      console.log(`Mencoba Gemini ${model} (${attempt + 1}/${attempts})`);

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": process.env.GEMINI_API_KEY,
            },

            body: JSON.stringify(requestBody),

            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          },
        );

        const result = await response.json().catch(() => ({}));

        lastResult = { response, result, model };

        if (response.ok) {
          console.log(`Gemini berhasil: ${model}`);
          return lastResult;
        }

        const message = result?.error?.message || "";

        console.warn(
          `Gemini ${model} gagal: HTTP ${response.status}. ${message}`,
        );

        // API key, izin, atau format permintaan bermasalah.
        if ([400, 401, 402, 403].includes(response.status)) {
          return lastResult;
        }

        // Model tidak ditemukan atau tidak tersedia.
        if (response.status === 404) {
          break;
        }

        // Ulangi hanya untuk gangguan sementara.
        if (!retryableStatuses.has(response.status)) {
          return lastResult;
        }

        if (attempt + 1 < attempts) {
          const delay = 1000 * 2 ** attempt + Math.floor(Math.random() * 500);

          console.log(`Mencoba ulang dalam ${delay} ms`);
          await sleep(delay);
        }
      } catch (error) {
        lastNetworkError = error;

        console.warn(`Koneksi ke ${model} gagal: ${error.message}`);

        if (attempt + 1 < attempts) {
          const delay = 1000 * 2 ** attempt + Math.floor(Math.random() * 500);

          await sleep(delay);
        }
      }
    }
  }

  // Jika seluruh panggilan gagal sebelum memperoleh respons HTTP.
  if (!lastResult && lastNetworkError) {
    throw lastNetworkError;
  }

  return lastResult;
}

// SERVER HTTP
export async function handleRequest(req, res) {
  let url;

  try {
    url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  } catch {
    return sendJson(res, 400, {
      error: "Alamat permintaan tidak valid.",
    });
  }

  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  // STATUS SERVER
  if (req.method === "GET" && pathname === "/api/health") {
    return sendJson(res, 200, {
      ok: true,
      configured: hasUsableApiKey(),
      model: MODEL,
      fallbackModels: FALLBACK_MODELS,
    });
  }

  // GENERATOR KASUS AI
  if (pathname === "/api/cases/generate") {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return sendJson(res, 405, {
        error: "Endpoint generator hanya menerima POST.",
      });
    }
    if (!allowedByRateLimit(req))
      return sendJson(res, 429, {
        error: "Terlalu banyak permintaan. Tunggu satu menit lalu coba lagi.",
      });
    if (!hasUsableApiKey())
      return sendJson(res, 503, {
        error: "Gemini belum dikonfigurasi. Periksa GEMINI_API_KEY di .env.",
      });
    try {
      const body = await readJson(req);
      const mode = body.mode === "custom" ? "custom" : "random";
      const allowedThemes = [
        "Pembunuhan",
        "Pencurian",
        "Penipuan",
        "Pemerasan",
        "Penculikan Fiktif",
        "Sabotase",
        "Misteri Benda Hilang",
        "Acak",
      ];
      const allowedDifficulties = ["MUDAH", "MENENGAH", "SULIT"];
      const tema =
        mode === "custom" && allowedThemes.includes(body.tema)
          ? body.tema
          : "Acak";
      const kesulitan =
        mode === "custom" && allowedDifficulties.includes(body.kesulitan)
          ? body.kesulitan
          : "MENENGAH";
      const jumlahTersangka =
        mode === "custom" && [3, 4, 5].includes(Number(body.jumlahTersangka))
          ? Number(body.jumlahTersangka)
          : 3;
      const prompt = `Buat satu kasus misteri fiktif interaktif berbahasa Indonesia untuk game TemukanTersangka. Mode: ${mode === "random" ? "acak sepenuhnya" : "kustom"}. Tema: ${tema}. Kesulitan: ${kesulitan}. Jumlah tersangka tepat ${jumlahTersangka}.

Aturan: tentukan satu pelaku resmi terlebih dahulu; kronologi, motif, alibi, bukti, dan jawaban interogasi harus konsisten. Untuk setiap tersangka, isi field jenisKelamin secara eksplisit dengan nilai tepat "laki-laki" atau "perempuan", konsisten dengan nama dan cerita karakter tersebut. Deskripsi publik tidak boleh membocorkan pelaku. Tersangka tak bersalah juga harus masuk akal untuk dicurigai. Semua karakter dan lokasi fiktif. Sertakan 4–8 bukti. Setiap tersangka memiliki 2 pertanyaan dan jawaban awal yang sesuai pengetahuan karakter. Gunakan ID tersangka S-01, S-02, dst. ID bukti B-01, B-02, dst. Jawaban hanya JSON tanpa Markdown dengan struktur: {"kasus":{"judul":"","tema":"","lokasi":"","waktu":"","kesulitan":"${kesulitan}","deskripsi":"","tujuan":""},"tersangka":[{"id":"S-01","nama":"","jenisKelamin":"perempuan","peran":"","inisial":"","deskripsi":"","alibi":"","pernyataan":"","catatan":""}],"barangBukti":[{"id":"B-01","nama":"","kategori":"","lokasi":"","ikon":"▤","ringkasan":"","detail":"","petunjuk":""}],"pertanyaanInterogasi":[[{"id":"q-1","pertanyaan":"","jawaban":"","catatan":""},{"id":"q-2","pertanyaan":"","jawaban":"","catatan":""}]],"hubunganBukti":{},"solusiRahasia":{"pelakuId":"S-02","motif":"","kronologi":"","buktiPenentu":["B-01"]}}. Isi semua field. Buat hubunganBukti dengan key format "B-01|B-02" bila ada hubungan yang masuk akal.`;
      const result = await callGemini({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      });
      if (!result)
        return sendJson(res, 502, {
          error: "Gemini tidak dapat dihubungi. Coba lagi.",
        });
      if (!result.response.ok) {
        const msg =
          result.result?.error?.message || "Gemini gagal membuat kasus.";
        return sendJson(res, result.response.status === 429 ? 429 : 502, {
          error: msg,
        });
      }
      const candidate = result.result?.candidates?.[0];
      const answer = (candidate?.content?.parts || [])
        .map((p) => p.text || "")
        .join("")
        .trim();
      if (!answer || candidate?.finishReason === "MAX_TOKENS")
        return sendJson(res, 502, {
          error: "Jawaban Gemini terpotong. Coba buat kasus lagi.",
        });
      let raw;
      try {
        raw = JSON.parse(answer);
      } catch {
        return sendJson(res, 502, {
          error: "Format jawaban Gemini bukan JSON valid. Silakan coba lagi.",
        });
      }
      try {
        const kasusAI = normalisasiKasusAI(
          raw,
          mode,
          tema,
          kesulitan,
          jumlahTersangka,
        );
        return sendJson(res, 200, {
          ok: true,
          kasus: kasusAI,
          model: result.model,
        });
      } catch (error) {
        console.warn("Kasus AI tidak lolos validasi:", error.message);
        return sendJson(res, 502, {
          error: `Kasus AI belum valid: ${error.message} Coba buat ulang.`,
        });
      }
    } catch (error) {
      if (error?.statusCode)
        return sendJson(res, error.statusCode, { error: error.message });
      console.error("Generator AI:", error);
      return sendJson(res, 500, {
        error: "Terjadi kesalahan saat membuat kasus AI.",
      });
    }
  }

  // VALIDASI ENDPOINT
  if (pathname === "/api/ai" && req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return sendJson(res, 405, {
      error:
        "Endpoint /api/ai hanya menerima POST. Gunakan fitur AI dari aplikasi.",
    });
  }

  if (req.method !== "POST" || pathname !== "/api/ai") {
    return sendJson(res, 404, {
      error:
        `Endpoint tidak ditemukan: ${req.method} ${url.pathname}. ` +
        "Endpoint AI yang benar adalah POST /api/ai.",
    });
  }

  //  BATAS PERMINTAAN
  if (!allowedByRateLimit(req)) {
    return sendJson(res, 429, {
      error:
        "Terlalu banyak permintaan ke server aplikasi. Tunggu satu menit lalu coba lagi.",
    });
  }

  // VALIDASI API KEY
  if (!hasUsableApiKey()) {
    return sendJson(res, 503, {
      error:
        "Gemini belum dikonfigurasi. Tambahkan GEMINI_API_KEY ke file .env di folder utama, lalu restart server AI.",
    });
  }

  try {
    const body = await readJson(req);
    const requestBody = buildRequest(body);

    const geminiResponse = await callGemini(requestBody);

    if (!geminiResponse) {
      return sendJson(res, 502, {
        error: "Semua model AI gagal dihubungi. Silakan coba lagi nanti.",
      });
    }

    const { response, result, model: usedModel } = geminiResponse;

    // PENANGANAN ERROR GEMINI
    if (!response.ok) {
      const upstreamMessage =
        result?.error?.message || "Tidak ada detail dari Gemini.";

      console.error(
        `Gemini API error ${response.status} (${usedModel}): ${upstreamMessage}`,
      );

      if (response.status === 401 || response.status === 403) {
        return sendJson(res, 502, {
          error:
            "Gemini menolak API key atau izin akses. Periksa key di file .env dan pastikan Gemini API aktif.",
        });
      }

      if (response.status === 429) {
        return sendJson(res, 429, {
          error:
            "Semua model yang dicoba gagal karena batas permintaan atau kuota Gemini. Periksa kuota API dan coba lagi nanti.",
        });
      }

      if (response.status === 404) {
        return sendJson(res, 502, {
          error:
            `Model '${usedModel}' tidak tersedia untuk proyek API ini. ` +
            `Periksa model di Google AI Studio. Detail: ${upstreamMessage}`,
        });
      }

      if (response.status === 503) {
        return sendJson(res, 503, {
          error:
            "Gemini sedang sibuk. Model utama dan model cadangan belum berhasil. Tunggu sebentar lalu coba lagi.",
        });
      }

      return sendJson(res, 502, {
        error: `Gemini gagal memproses permintaan (HTTP ${response.status}). ${upstreamMessage}`,
      });
    }

    // MEMBACA HASIL GENERASI
    const candidate = result?.candidates?.[0];
    const finishReason = candidate?.finishReason;

    const answer = (candidate?.content?.parts || [])
      .map((part) => part.text || "")
      .join("\n")
      .trim();

    console.log(
      `Model: ${usedModel} | finishReason: ${finishReason || "unknown"} | Panjang jawaban: ${answer.length}`,
    );

    if (!answer) {
      const blockReason = result?.promptFeedback?.blockReason;

      return sendJson(res, 502, {
        error: blockReason
          ? `Gemini tidak menghasilkan jawaban karena permintaan diblokir (${blockReason}).`
          : `Gemini tidak mengembalikan jawaban teks. Alasan berhenti: ${finishReason || "tidak diketahui"}.`,
      });
    }

    const truncated = finishReason === "MAX_TOKENS";

    if (truncated) {
      console.warn("PERINGATAN: Jawaban Gemini mencapai batas token.");
    }

    return sendJson(res, 200, {
      answer,
      model: usedModel,
      finishReason: finishReason || null,
      truncated,
    });
  } catch (error) {
    if (res.writableEnded || res.destroyed) return;

    if (error?.statusCode) {
      return sendJson(res, error.statusCode, {
        error: error.message,
      });
    }

    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      return sendJson(res, 504, {
        error: "Permintaan AI terlalu lama. Silakan coba lagi.",
      });
    }

    console.error("Kesalahan server AI:", error?.message || error);

    return sendJson(res, 500, {
      error: "Terjadi kesalahan pada server AI.",
    });
  }
}

// MENJALANKAN SERVER LOKAL (tidak dipakai oleh Vercel Functions)
if (process.env.VERCEL !== "1") {
  const server = http.createServer(handleRequest);
  server.listen(PORT, () => {
    console.log(
      `Server TemukanTersangka AI berjalan di http://localhost:${PORT}`,
    );

    console.log(
      `Gemini API key: ${
        hasUsableApiKey()
          ? "sudah terdeteksi"
          : "belum diatur atau masih placeholder (.env)"
      }`,
    );

    console.log(`Model utama: ${MODEL}`);
    console.log(`Model cadangan: ${FALLBACK_MODELS.join(", ")}`);
  });
}
