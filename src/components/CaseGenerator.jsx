import { useState } from "react";
import {
  ArrowLeft,
  Archive,
  Sparkles,
  Shuffle,
  Settings2,
  Play,
  Trash2,
  Clock3,
  MapPin,
  Users,
  LoaderCircle,
  FolderOpen,
} from "lucide-react";

const KEY = "temukantersangka-arsip-ai-v1";
const THEMES = [
  "Acak",
  "Pembunuhan",
  "Pencurian",
  "Penipuan",
  "Pemerasan",
  "Penculikan Fiktif",
  "Sabotase",
  "Misteri Benda Hilang",
];

function tentukanGenderTersangka(orang = {}) {
  const eksplisit = String(
    orang.jenisKelamin || orang.gender || orang.kelamin || "",
  )
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
    orang.nama,
    orang.peran,
    orang.deskripsi,
    orang.alibi,
    orang.pernyataan,
    orang.catatan,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (
    /\b(perempuan|wanita|ibu|nyonya|nona|mbak|saudari|putri|istri|janda|she|her|female|woman)\b/.test(
      konteks,
    )
  )
    return "perempuan";
  if (
    /\b(laki-laki|pria|bapak|pak|mas|saudara|putra|suami|duda|he|him|male|man)\b/.test(
      konteks,
    )
  )
    return "laki-laki";
  const nama = String(orang.nama || "")
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
}

function nomorFoto(nama = "TT") {
  let hash = 0;
  for (const char of String(nama))
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return (hash % 99) + 1;
}

function perbaruiFotoTersangka(item) {
  if (!item || typeof item !== "object") return item;
  const daftar = item.kasus?.tersangka ?? item.tersangka ?? [];
  if (!Array.isArray(daftar)) return item;
  const tersangka = daftar.map((orang) => {
    const jenisKelamin = tentukanGenderTersangka(orang);
    return {
      ...orang,
      jenisKelamin,
      foto: `https://randomuser.me/api/portraits/${jenisKelamin === "perempuan" ? "women" : "men"}/${nomorFoto(orang.nama)}.jpg`,
    };
  });
  const hasil = {
    ...item,
    tersangka,
    wawancaraTersangka: Array.isArray(item.wawancaraTersangka)
      ? item.wawancaraTersangka.map(
          (orang) =>
            tersangka.find((x) => x.id === orang.id) || {
              ...orang,
              jenisKelamin: tentukanGenderTersangka(orang),
              foto: `https://randomuser.me/api/portraits/${tentukanGenderTersangka(orang) === "perempuan" ? "women" : "men"}/${nomorFoto(orang.nama)}.jpg`,
            },
        )
      : tersangka,
  };
  if (item.kasus) hasil.kasus = { ...item.kasus, tersangka };
  return hasil;
}

function readArchive() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(data)) return [];
    const diperbarui = data.map(perbaruiFotoTersangka);
    // Migrasi arsip lama yang masih memakai foto LEGO tanpa menghapus kasus/progres.
    try {
      localStorage.setItem(KEY, JSON.stringify(diperbarui));
    } catch {
      /* Arsip tetap bisa ditampilkan jika browser menolak penulisan. */
    }
    return diperbarui;
  } catch {
    return [];
  }
}

export default function CaseGenerator({ kembali, mainkan }) {
  const [arsip, setArsip] = useState(readArchive);
  const [mode, setMode] = useState("random");
  const [tema, setTema] = useState("Acak");
  const [kesulitan, setKesulitan] = useState("MENENGAH");
  const [jumlahTersangka, setJumlahTersangka] = useState("3");
  const [memuat, setMemuat] = useState(false);
  const [error, setError] = useState("");
  const [pesan, setPesan] = useState("");

  function simpanArsip(dataBerikutnya) {
    setArsip(dataBerikutnya);
    try {
      localStorage.setItem(KEY, JSON.stringify(dataBerikutnya));
    } catch {
      setError("Penyimpanan browser penuh. Hapus sebagian arsip lama.");
    }
  }

  async function buatKasus() {
    setMemuat(true);
    setError("");
    setPesan("");
    try {
      const response = await fetch("/api/cases/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          tema,
          kesulitan,
          jumlahTersangka: Number(jumlahTersangka),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.kasus)
        throw new Error(data.error || "Kasus belum berhasil dibuat.");
      const generated = perbaruiFotoTersangka(data.kasus);
      simpanArsip([
        generated,
        ...arsip.filter((item) => item.id !== generated.id),
      ]);
      setPesan(
        `Kasus “${generated.kasus.judul}” berhasil dibuat dan disimpan ke arsip.`,
      );
      mainkan(generated);
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "Tidak dapat terhubung ke backend. Pastikan npm run server sedang berjalan."
          : e.message || "Gagal membuat kasus.",
      );
    } finally {
      setMemuat(false);
    }
  }

  function hapusKasus(id) {
    if (
      !window.confirm(
        "Hapus kasus ini dari arsip? Progres lokal kasus tersebut juga akan dihapus.",
      )
    )
      return;
    simpanArsip(arsip.filter((item) => item.id !== id));
    localStorage.removeItem(`temukantersangka-progres-${id}`);
    localStorage.removeItem(`temukantersangka-rekor-${id}`);
  }

  return (
    <main className="halaman-detail halaman-generator-ai">
      <button className="kembali" onClick={kembali}>
        <ArrowLeft size={15} /> Kembali ke Beranda
      </button>
      <div className="label-atas">
        <span className="garis-emas" /> UNIT KASUS DINAMIS / GENERATOR AI
      </div>
      <h1 className="judul-detail">
        Ciptakan <em>misteri baru.</em>
      </h1>
      <p className="detail-pembuka">
        AI menyusun skenario, tersangka, alibi, dan barang bukti. Setiap kasus
        yang valid disimpan di arsip agar bisa dimainkan kembali.
      </p>

      <section className="generator-panel panel-detail">
        <div className="generator-heading">
          <Sparkles size={22} />
          <div>
            <span className="label-panel">CASE GENERATOR</span>
            <h2>Buat kasus investigasi</h2>
          </div>
        </div>
        <div className="generator-mode-grid">
          <button
            type="button"
            className={`generator-mode ${mode === "random" ? "aktif" : ""}`}
            onClick={() => setMode("random")}
          >
            <Shuffle size={22} />
            <strong>Acak otomatis</strong>
            <span>AI menentukan tema dan detail kasus.</span>
          </button>
          <button
            type="button"
            className={`generator-mode ${mode === "custom" ? "aktif" : ""}`}
            onClick={() => setMode("custom")}
          >
            <Settings2 size={22} />
            <strong>Kustomisasi</strong>
            <span>Pilih tema, kesulitan, dan jumlah tersangka.</span>
          </button>
        </div>
        {mode === "custom" && (
          <div className="generator-form-grid">
            <label>
              Tema misteri
              <select value={tema} onChange={(e) => setTema(e.target.value)}>
                {THEMES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Tingkat kesulitan
              <select
                value={kesulitan}
                onChange={(e) => setKesulitan(e.target.value)}
              >
                <option value="MUDAH">Mudah</option>
                <option value="MENENGAH">Menengah</option>
                <option value="SULIT">Sulit</option>
              </select>
            </label>
            <label>
              Jumlah tersangka
              <select
                value={jumlahTersangka}
                onChange={(e) => setJumlahTersangka(e.target.value)}
              >
                <option value="3">3 tersangka</option>
                <option value="4">4 tersangka</option>
                <option value="5">5 tersangka</option>
              </select>
            </label>
          </div>
        )}
        <button
          className="tombol tombol-emas generator-submit"
          onClick={buatKasus}
          disabled={memuat}
        >
          {memuat ? (
            <>
              <LoaderCircle className="spin" size={17} /> Menyusun kasus...
            </>
          ) : (
            <>
              <Sparkles size={17} /> Buat Kasus dengan AI
            </>
          )}
        </button>
        {memuat && (
          <p className="generator-note">
            AI sedang menyusun kronologi dan memeriksa struktur kasus. Proses
            ini bisa memerlukan beberapa saat.
          </p>
        )}
        {error && <div className="generator-alert error">{error}</div>}
        {pesan && <div className="generator-alert success">{pesan}</div>}
      </section>

      <section className="arsip-ai-section">
        <div className="bagian-heading">
          <div>
            <div className="label-atas">
              <span className="garis-emas" /> ARSIP PRIBADI
            </div>
            <h2>
              Kasus yang <em>pernah dibuat.</em>
            </h2>
            <p>Kasus disimpan di browser ini dan bisa dibuka kembali.</p>
          </div>
          <span className="arsip-hitung">{arsip.length} KASUS AI</span>
        </div>
        {!arsip.length ? (
          <div className="arsip-ai-kosong">
            <Archive size={32} />
            <strong>Belum ada kasus buatan AI</strong>
            <p>Buat kasus pertama untuk mengisi arsip investigasimu.</p>
          </div>
        ) : (
          <div className="arsip-ai-grid">
            {arsip.map((item) => (
              <article className="arsip-ai-card" key={item.id}>
                <div className="arsip-ai-card-top">
                  <span className="tingkat-kesulitan">
                    {item.kasus.kesulitan}
                  </span>
                  <span className="arsip-ai-id">{item.id}</span>
                </div>
                <h3>{item.kasus.judul}</h3>
                <p>{item.kasus.deskripsi}</p>
                <div className="arsip-ai-meta">
                  <span>
                    <MapPin size={14} />
                    {item.kasus.lokasi}
                  </span>
                  <span>
                    <Users size={14} />
                    {
                      (item.kasus?.tersangka ?? item.tersangka ?? []).length
                    }{" "}
                    tersangka
                  </span>
                  <span>
                    <Clock3 size={14} />
                    {item.kasus.tema}
                  </span>
                </div>
                <div className="arsip-ai-actions">
                  <button
                    className="tombol tombol-emas"
                    onClick={() => mainkan(item)}
                  >
                    <Play size={15} /> Mainkan kasus
                  </button>
                  <button
                    className="arsip-hapus"
                    title="Hapus dari arsip"
                    onClick={() => hapusKasus(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        <button
          className="tombol tombol-outline generator-back"
          onClick={kembali}
        >
          <FolderOpen size={16} /> Kembali ke beranda
        </button>
      </section>
    </main>
  );
}
