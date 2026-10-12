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

const PORT = Number(process.env.API_PORT || 3001);

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

// MEMBANGUN PERMINTAAN AI
function buildRequest(body) {
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

    const validSuspects = [
      "Victoria Blackwood",
      "Edward Hayes",
      "Arthur Wells",
    ];

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
${CASE_CONTEXT}

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
${CASE_CONTEXT}

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

// MEMANGGIL GEMINI DENGAN RETRY DAN MODEL CADANGAN
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
const server = http.createServer(async (req, res) => {
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
});

// MENJALANKAN SERVER
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
