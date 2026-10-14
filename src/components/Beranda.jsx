import { useState } from "react";
import {
  Search,
  FileText,
  Shield,
  ArrowUpRight,
  LockKeyhole,
  Clock3,
  MapPin,
  ChevronRight,
  Eye,
  UserRound,
  Sparkles,
} from "lucide-react";
import {
  kasus,
  bacaProgresTersimpan,
  KUNCI_PROGRES,
} from "../data/caseData.js";
import IlustrasiKasus from "./IlustrasiKasus.jsx";
import Logo from "./Logo";

const KUNCI_ARSIP_AI = "temukantersangka-arsip-ai-v1";

function jenisKelaminTersangka(orang = {}) {
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

function migrasikanFotoKasus(item) {
  const daftar = item?.kasus?.tersangka ?? item?.tersangka ?? [];
  if (!Array.isArray(daftar)) return item;
  const tersangka = daftar.map((orang) => {
    const gender = jenisKelaminTersangka(orang);
    return {
      ...orang,
      jenisKelamin: gender,
      foto: `https://randomuser.me/api/portraits/${gender === "perempuan" ? "women" : "men"}/${nomorFoto(orang.nama)}.jpg`,
    };
  });
  const wawancaraTersangka = Array.isArray(item.wawancaraTersangka)
    ? item.wawancaraTersangka.map(
        (orang) => tersangka.find((x) => x.id === orang.id) || orang,
      )
    : tersangka;
  return {
    ...item,
    tersangka,
    wawancaraTersangka,
    kasus: item.kasus ? { ...item.kasus, tersangka } : item.kasus,
  };
}

function bacaArsipAI() {
  try {
    const data = JSON.parse(
      window.localStorage.getItem(KUNCI_ARSIP_AI) || "[]",
    );
    if (!Array.isArray(data)) return [];
    const diperbarui = data
      .filter((item) => item?.id && item?.kasus)
      .map(migrasikanFotoKasus);
    try {
      window.localStorage.setItem(KUNCI_ARSIP_AI, JSON.stringify(diperbarui));
    } catch {
      /* Arsip tetap bisa dipakai jika penyimpanan browser menolak penulisan. */
    }
    return diperbarui;
  } catch {
    return [];
  }
}

function statusKasusAI(item) {
  return (
    bacaProgresTersimpan(`temukantersangka-progres-${item.id}`).hasilTuduhan ===
    "benar"
  );
}

export default function Beranda({ bukaKasus, bukaGenerator, mainkanKasusAI }) {
  const [arsipAI] = useState(bacaArsipAI);
  const kasusSelesai =
    bacaProgresTersimpan(KUNCI_PROGRES).hasilTuduhan === "benar";
  const jumlahKasus = 1 + arsipAI.length;
  const jumlahTersangka =
    kasus.tersangka.length +
    arsipAI.reduce(
      (total, item) =>
        total + (item.kasus?.tersangka?.length || item.tersangka?.length || 0),
      0,
    );

  return (
    <>
      <section className="hero" id="beranda">
        <div className="hero-konten">
          <div className="label-atas">
            <span className="garis-emas" />
            SEBUAH PENGALAMAN INVESTIGASI INTERAKTIF
          </div>
          <h1>
            Setiap petunjuk
            <br />
            punya <em>cerita.</em>
          </h1>
          <p className="hero-deskripsi">
            Kebenaran tidak pernah datang dengan mudah. Periksa bukti,
            interogasi tersangka, dan ungkap rahasia yang tersembunyi di balik
            setiap kasus.
          </p>
          <div className="hero-tombol">
            <button className="tombol tombol-emas" onClick={bukaKasus}>
              <Search size={17} />
              Mulai Investigasi
              <ArrowUpRight size={17} />
            </button>
            <a className="tombol tombol-transparan" href="#cara-bermain">
              Pelajari Cara Bermain <ChevronRight size={16} />
            </a>
          </div>
          <div className="hero-statistik">
            <div>
              <strong>{String(jumlahKasus).padStart(2, "0")}</strong>
              <span>Kasus tersedia</span>
            </div>
            <span className="statistik-pemisah" />
            <div>
              <strong>{String(jumlahTersangka).padStart(2, "0")}</strong>
              <span>Calon tersangka</span>
            </div>
            <span className="statistik-pemisah" />
            <div>
              <strong>{String(arsipAI.length).padStart(2, "0")}</strong>
              <span>Kasus buatan AI</span>
            </div>
          </div>
        </div>
        <IlustrasiKasus />
        <div className="hero-penanda">
          <span>TT / 001</span>
          <span>ARSIP INVESTIGASI</span>
        </div>
      </section>

      <section className="bagian-kasus" id="kasus">
        <div className="bagian-heading">
          <div>
            <div className="label-atas">
              <span className="garis-emas" />
              ARSIP INVESTIGASI
            </div>
            <h2>
              Kasus yang <em>menunggu.</em>
            </h2>
            <p>Pilih berkas kasus dan mulailah mencari kebenaran.</p>
          </div>
          <span className="arsip-hitung">
            ARSIP AKTIF / {String(jumlahKasus).padStart(3, "0")}
          </span>
        </div>

        <section className="ai-generator-promo">
          <div className="ai-promo-icon">
            <Sparkles size={24} />
          </div>
          <div>
            <span className="label-panel">UNIT KASUS DINAMIS</span>
            <h2>Misteri baru, setiap kali bermain.</h2>
            <p>
              Buat skenario investigasi dengan AI, pilih tema sendiri atau
              biarkan Gemini menentukan misterinya, lalu simpan di arsip
              pribadi.
            </p>
          </div>
          <button className="tombol tombol-emas" onClick={bukaGenerator}>
            <Sparkles size={16} /> Buka AI Case Generator{" "}
            <ArrowUpRight size={16} />
          </button>
        </section>

        <article className="kartu-kasus">
          <div className="kartu-nomor">
            <span>BERKAS NO.</span>
            <strong>MM—001</strong>
            <div
              className={`kartu-cap ${kasusSelesai ? "kartu-cap-selesai" : ""}`}
            >
              {kasusSelesai ? (
                <>
                  BERHASIL
                  <br />
                  TERPECAHKAN
                </>
              ) : (
                <>
                  BELUM
                  <br />
                  TERPECAHKAN
                </>
              )}
            </div>
          </div>
          <div className="kartu-isi">
            <div className="kartu-label">
              <span
                className={
                  kasusSelesai ? "status-selesai-arsip" : "status-merah"
                }
              >
                <span /> {kasusSelesai ? "KASUS TERPECAHKAN" : "KASUS TERBUKA"}
              </span>
              <span className="tingkat-kesulitan">MENENGAH</span>
            </div>
            <h3>{kasus.judul}</h3>
            <p>{kasus.deskripsi}</p>
            <div className="metadata-kasus">
              <span>
                <MapPin size={14} /> {kasus.lokasi}
              </span>
              <span>
                <Clock3 size={14} /> {kasus.waktu}
              </span>
            </div>
          </div>
          <button
            className="kartu-panah"
            onClick={bukaKasus}
            aria-label="Buka kasus"
          >
            <ArrowUpRight size={23} />
          </button>
        </article>
        {arsipAI.map((item) => {
          const selesai = statusKasusAI(item);
          const dataKasus = item.kasus;
          const jumlahTersangkaAI =
            dataKasus.tersangka?.length || item.tersangka?.length || 0;
          return (
            <article className="kartu-kasus kartu-kasus-ai" key={item.id}>
              <div className="kartu-nomor">
                <span>BERKAS AI</span>
                <strong>{item.id}</strong>
                <div
                  className={`kartu-cap ${selesai ? "kartu-cap-selesai" : ""}`}
                >
                  {selesai ? (
                    <>
                      BERHASIL
                      <br />
                      TERPECAHKAN
                    </>
                  ) : (
                    <>
                      BELUM
                      <br />
                      TERPECAHKAN
                    </>
                  )}
                </div>
              </div>
              <div className="kartu-isi">
                <div className="kartu-label">
                  <span
                    className={
                      selesai ? "status-selesai-arsip" : "status-merah"
                    }
                  >
                    <span /> {selesai ? "KASUS TERPECAHKAN" : "KASUS TERBUKA"}
                  </span>
                  <span className="tingkat-kesulitan">
                    {dataKasus.kesulitan || "AI"}
                  </span>
                </div>
                <h3>{dataKasus.judul}</h3>
                <p>{dataKasus.deskripsi}</p>
                <div className="metadata-kasus">
                  <span>
                    <MapPin size={14} /> {dataKasus.lokasi}
                  </span>
                  <span>
                    <Clock3 size={14} /> {dataKasus.waktu}
                  </span>
                  <span>
                    <UserRound size={14} /> {jumlahTersangkaAI} tersangka
                  </span>
                </div>
              </div>
              <button
                className="kartu-panah"
                onClick={() => mainkanKasusAI(item)}
                aria-label={`Mainkan ${dataKasus.judul}`}
              >
                <ArrowUpRight size={23} />
              </button>
            </article>
          );
        })}
        <div className="catatan-arsip">
          <LockKeyhole size={14} />
          <span>
            Kasus bawaan dan semua kasus dari Arsip Pribadi ditampilkan di sini.
            Arsip AI tersimpan pada browser ini.
          </span>
        </div>
      </section>

      <section className="bagian-cara" id="cara-bermain">
        <div className="bagian-heading">
          <div>
            <div className="label-atas">
              <span className="garis-emas" />
              PROSEDUR INVESTIGASI
            </div>
            <h2>
              Berpikir seperti <em>detektif.</em>
            </h2>
          </div>
        </div>
        <div className="langkah-grid">
          <div className="langkah">
            <span className="langkah-nomor">01 /</span>
            <FileText size={24} />
            <h3>Pelajari Kasus</h3>
            <p>
              Baca laporan awal, kenali korban, dan pahami kronologi kejadian.
            </p>
          </div>
          <div className="langkah">
            <span className="langkah-nomor">02 /</span>
            <Eye size={24} />
            <h3>Periksa Petunjuk</h3>
            <p>
              Temukan detail yang janggal dan bandingkan keterangan para
              tersangka.
            </p>
          </div>
          <div className="langkah">
            <span className="langkah-nomor">03 /</span>
            <UserRound size={24} />
            <h3>Interogasi</h3>
            <p>
              Ajukan pertanyaan, uji alibi, dan cari kontradiksi dalam jawaban.
            </p>
          </div>
          <div className="langkah">
            <span className="langkah-nomor">04 /</span>
            <Shield size={24} />
            <h3>Ungkap Kebenaran</h3>
            <p>
              Pilih tersangka dan jelaskan bukti serta motif yang mendukung
              tuduhanmu.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <Logo kecil />
        <span>SETIAP PETUNJUK PUNYA CERITA.</span>
        <span>© 2026 Maulana Hidayatulloh</span>
      </footer>
    </>
  );
}
