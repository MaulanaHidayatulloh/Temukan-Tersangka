import { useState } from "react";
import {
  Fingerprint,
  Search,
  FileText,
  Shield,
  ArrowUpRight,
  LockKeyhole,
  Clock3,
  MapPin,
  ChevronRight,
  X,
  Eye,
  UserRound,
  BookOpen,
  SearchCheck,
  CheckCircle2,
  AlertTriangle,
  NotebookPen,
  Gavel,
} from "lucide-react";
import "./index.css";

const kasus = {
  id: "MM-001",
  judul: "Pembunuhan Tengah Malam",
  lokasi: "Kediaman Blackwood",
  waktu: "23.30 WIB",
  kesulitan: "MENENGAH",
  deskripsi:
    "Seorang pengusaha terkemuka ditemukan tewas di ruang kerjanya yang terkunci. Tiga orang berada di sekitar lokasi malam itu. Masing-masing memiliki alibi, tetapi tidak semuanya mengatakan yang sebenarnya.",
  tujuan:
    "Temukan siapa pelakunya, ungkap motifnya, dan susun bukti yang mengarah pada kebenaran.",
  tersangka: [
    {
      nama: "Victoria Blackwood",
      peran: "Istri korban",
      inisial: "VB",
      deskripsi:
        "Mengaku berada di sayap timur kediaman saat kejadian. Hubungannya dengan korban belakangan dikabarkan memburuk.",
      warna: "merah",
    },
    {
      nama: "Edward Hayes",
      peran: "Mitra bisnis",
      inisial: "EH",
      deskripsi:
        "Bersikeras telah meninggalkan kediaman sebelum tengah malam. Ia memiliki kepentingan bisnis bersama korban.",
      warna: "emas",
    },
    {
      nama: "Arthur Wells",
      peran: "Kepala pelayan",
      inisial: "AW",
      deskripsi:
        "Orang terakhir yang mengaku menyajikan minuman untuk korban. Ia telah bekerja di kediaman itu selama bertahun-tahun.",
      warna: "abu",
    },
  ],
};

function Logo({ kecil = false }) {
  return (
    <a
      className={`logo ${kecil ? "logo-kecil" : ""}`}
      href="#beranda"
      aria-label="TemukanTersangka — Beranda"
    >
      <span className="logo-simbol">
        <span className="logo-sudut logo-sudut-atas" />
        <span className="logo-monogram">TT</span>
        <span className="logo-sudut logo-sudut-bawah" />
        <span className="logo-titik" />
      </span>

      <span className="logo-teks">
        <strong className="logo-nama">
          TEMUKAN<span>TERSANGKA</span>
        </strong>
        <small>SETIAP PETUNJUK PUNYA CERITA</small>
      </span>
    </a>
  );
}

function Header({ bukaKasus, halaman, bagianAktif, setBagianAktif }) {
  const sedangBermain = halaman !== "beranda";

  return (
    <header className={`header ${sedangBermain ? "header-saat-bermain" : ""}`}>
      <Logo />

      {!sedangBermain && (
        <>
          <nav className="navigasi">
            <a
              href="#beranda"
              className={bagianAktif === "beranda" ? "nav-aktif" : ""}
              onClick={() => setBagianAktif("beranda")}
            >
              Beranda
            </a>

            <a
              href="#cara-bermain"
              className={bagianAktif === "cara-bermain" ? "nav-aktif" : ""}
              onClick={() => setBagianAktif("cara-bermain")}
            >
              Cara Bermain
            </a>

            <a
              href="#kasus"
              className={bagianAktif === "kasus" ? "nav-aktif" : ""}
              onClick={() => setBagianAktif("kasus")}
            >
              Arsip Kasus
            </a>
          </nav>

          <button
            className="tombol tombol-kecil tombol-outline"
            onClick={bukaKasus}
          >
            <Fingerprint size={16} />
            Mulai Menyelidiki
          </button>
        </>
      )}
    </header>
  );
}

function IlustrasiKasus() {
  return (
    <div className="ilustrasi-kasus" aria-label="Ilustrasi ruang investigasi">
      <div className="ilustrasi-kabut" />
      <div className="jendela">
        <div className="jendela-bingkai" />
        <div className="jendela-bingkai vertikal" />
        <div className="bulan" />
      </div>
      <div className="bayangan-bangunan" />
      <div className="lampu-gantung">
        <span />
      </div>
      <div className="meja">
        <div className="kertas kertas-satu" />
        <div className="kertas kertas-dua" />
        <div className="berkas-merah" />
        <div className="kaca-pembesar">
          <span />
        </div>
      </div>
      <div className="label-ilustrasi">
        <span className="titik-merah" />
        TKP — BLACKWOOD MANOR
      </div>
      <div className="cap-rahasia">RAHASIA</div>
    </div>
  );
}

function Beranda({ bukaKasus }) {
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
              <strong>01</strong>
              <span>Kasus tersedia</span>
            </div>
            <span className="statistik-pemisah" />
            <div>
              <strong>03</strong>
              <span>Calon tersangka</span>
            </div>
            <span className="statistik-pemisah" />
            <div>
              <strong>∞</strong>
              <span>Pertanyaan untuk digali</span>
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
          <span className="arsip-hitung">ARSIP AKTIF / 001</span>
        </div>

        <article className="kartu-kasus">
          <div className="kartu-nomor">
            <span>BERKAS NO.</span>
            <strong>MM—001</strong>
            <div className="kartu-cap">
              BELUM
              <br />
              TERPECAHKAN
            </div>
          </div>
          <div className="kartu-isi">
            <div className="kartu-label">
              <span className="status-merah">
                <span /> KASUS TERBUKA
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
        <div className="catatan-arsip">
          <LockKeyhole size={14} />
          <span>
            Kasus tambahan akan tersedia seiring pengembangan unit investigasi.
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

function DetailKasus({ kembali, mulai }) {
  return (
    <main className="halaman-detail">
      <button className="kembali" onClick={kembali}>
        ← Kembali ke Beranda
      </button>
      <div className="label-atas">
        <span className="garis-emas" />
        BERKAS INVESTIGASI / MM-001
      </div>
      <h1 className="judul-detail">
        Pembunuhan <em>Tengah Malam.</em>
      </h1>
      <p className="detail-pembuka">
        Satu korban. Tiga tersangka. Sebuah rahasia yang belum terungkap.
      </p>

      <div className="detail-grid">
        <section className="panel-detail">
          <span className="label-panel">01 / LAPORAN AWAL</span>
          <h2>Insiden di Blackwood Manor</h2>
          <p>{kasus.deskripsi}</p>
          <p>{kasus.tujuan}</p>
          <div className="detail-metadata">
            <span>
              <MapPin size={15} /> Kediaman Blackwood
            </span>
            <span>
              <Clock3 size={15} /> Pukul 23.30 WIB
            </span>
          </div>
          <div className="peringatan-detail">
            <LockKeyhole size={17} />
            <span>
              Seluruh tokoh dan kejadian dalam kasus ini bersifat fiktif.
              Gunakan informasi dalam berkas sebagai dasar penyelidikan.
            </span>
          </div>
        </section>

        <section className="panel-detail">
          <span className="label-panel">02 / DAFTAR PERSONEL</span>
          <h2>Tiga orang. Tiga cerita.</h2>
          <div className="daftar-tersangka">
            {kasus.tersangka.map((orang, index) => (
              <article className="tersangka" key={orang.inisial}>
                <div className={`avatar avatar-${orang.warna}`}>
                  {orang.inisial}
                </div>
                <div className="tersangka-info">
                  <h3>{orang.nama}</h3>
                  <span>{orang.peran}</span>
                  <p>{orang.deskripsi}</p>
                </div>
                <span className="tersangka-index">0{index + 1}</span>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="mulai-detail">
        <div>
          <span className="label-panel">LANGKAH BERIKUTNYA</span>
          <h2>Siap membuka penyelidikan?</h2>
          <p>Masuk ke ruang investigasi untuk melanjutkan kasus ini.</p>
        </div>
        <button className="tombol tombol-emas" onClick={mulai}>
          Buka Ruang Investigasi <ArrowUpRight size={17} />
        </button>
      </div>
    </main>
  );
}

const barangBukti = [
  {
    id: "B-01",
    nama: "Cangkir teh porselen",
    kategori: "BARANG FISIK",
    lokasi: "Meja kerja korban",
    ikon: "☕",
    ringkasan: "Cangkir yang digunakan korban pada malam kejadian.",
    detail:
      "Di dasar cangkir ditemukan sisa seduhan dengan aroma pahit yang tidak biasa. Catatan pemeriksaan awal menunjukkan korban hanya meminum teh yang disajikan setelah pukul 23.00.",
    petunjuk: "Minuman korban kemungkinan telah dicampur zat berbahaya.",
  },
  {
    id: "B-02",
    nama: "Buku jadwal pelayan",
    kategori: "DOKUMEN",
    lokasi: "Ruang servis",
    ikon: "▤",
    ringkasan: "Catatan aktivitas staf pada malam kejadian.",
    detail:
      "Jadwal mencatat Arthur Wells membawa nampan minuman ke ruang kerja pukul 23.12. Tidak ada staf lain yang tercatat memasuki ruangan setelah itu, meskipun Edward mengaku masih berada di koridor.",
    petunjuk:
      "Arthur memiliki kesempatan langsung untuk menyentuh minuman korban.",
  },
  {
    id: "B-03",
    nama: "Halaman buku besar robek",
    kategori: "DOKUMEN KEUANGAN",
    lokasi: "Laci meja korban",
    ikon: "▧",
    ringkasan: "Satu halaman laporan keuangan hilang dari buku besar.",
    detail:
      "Catatan yang tersisa menunjukkan korban sedang menelusuri pengeluaran rumah tangga yang tidak wajar. Namun, bukti ini belum cukup untuk menghubungkan pengeluaran tersebut dengan salah satu tersangka.",
    petunjuk: "Ada rahasia keuangan, tetapi motifnya belum dapat dipastikan.",
  },
  {
    id: "B-04",
    nama: "Kunci ruang kerja cadangan",
    kategori: "BARANG FISIK",
    lokasi: "Lemari ruang servis",
    ikon: "⚿",
    ringkasan: "Kunci cadangan yang seharusnya disimpan di lemari terkunci.",
    detail:
      "Kunci ditemukan tidak berada di tempat penyimpanan biasanya. Arthur sebagai kepala pelayan mengetahui prosedur akses lemari itu, tetapi beberapa staf lain juga pernah menggunakan ruang servis.",
    petunjuk:
      "Seseorang mungkin menyiapkan akses ke ruang kerja tanpa menarik perhatian.",
  },
];

const wawancaraTersangka = [
  {
    nama: "Victoria Blackwood",
    peran: "Istri korban",
    inisial: "VB",
    warna: "merah",
    alibi: "Mengaku berada di sayap timur kediaman sejak pukul 22.45.",
    pernyataan:
      '"Saya mendengar suara dari ruang kerja, tetapi saya tidak masuk. Kami memang bertengkar, namun saya tidak ingin suami saya mati."',
    catatan:
      "Motif emosional mungkin ada, tetapi belum ada bukti yang menempatkannya di ruang kerja pada waktu kritis.",
  },
  {
    nama: "Edward Hayes",
    peran: "Mitra bisnis",
    inisial: "EH",
    warna: "emas",
    alibi: "Mengaku meninggalkan kediaman sebelum pukul 23.00.",
    pernyataan:
      '"Saya datang untuk membicarakan urusan bisnis. Saya pergi sebelum malam semakin larut dan tidak tahu apa yang terjadi setelahnya."',
    catatan:
      "Catatan keuangan yang hilang patut diselidiki, tetapi alibinya belum terkonfirmasi maupun terbantahkan.",
  },
  {
    nama: "Arthur Wells",
    peran: "Kepala pelayan",
    inisial: "AW",
    warna: "abu",
    alibi: "Mengaku selesai melayani minuman lalu kembali ke ruang servis.",
    pernyataan:
      '"Saya hanya menjalankan tugas seperti biasa. Tuan Blackwood meminta teh, jadi saya mengantarkannya. Saya tidak melihat sesuatu yang aneh."',
    catatan:
      "Jadwal pelayanan menempatkan Arthur sebagai orang yang terakhir membawa minuman ke korban. Keterangannya perlu dicocokkan dengan bukti fisik.",
  },
];

function RuangInvestigasi({ kembali }) {
  const [tab, setTab] = useState("bukti");
  const [buktiDibuka, setBuktiDibuka] = useState(null);
  const [buktiDitemukan, setBuktiDitemukan] = useState([]);
  const [tersangkaDipilih, setTersangkaDipilih] = useState(0);
  const [catatan, setCatatan] = useState("");
  const [tuduhan, setTuduhan] = useState("");
  const [hasilTuduhan, setHasilTuduhan] = useState(null);

  const buktiAktif = barangBukti.find((item) => item.id === buktiDibuka);
  const persentase = Math.round(
    (buktiDitemukan.length / barangBukti.length) * 100,
  );

  function periksaBukti(bukti) {
    setBuktiDibuka(bukti.id);
    setBuktiDitemukan((sebelumnya) =>
      sebelumnya.includes(bukti.id) ? sebelumnya : [...sebelumnya, bukti.id],
    );
  }

  function simpanCatatan() {
    if (!catatan.trim()) return;
    setCatatan((sebelumnya) => sebelumnya.trim());
    setTab("jurnal");
  }

  function kirimTuduhan() {
    if (!tuduhan) return;
    setHasilTuduhan(tuduhan === "Arthur Wells" ? "benar" : "belum");
  }

  return (
    <main className="halaman-detail halaman-ruang-investigasi">
      <button className="kembali" onClick={kembali}>
        ← Kembali ke Berkas
      </button>
      <div className="label-atas">
        <span className="garis-emas" />
        RUANG INVESTIGASI / MM-001
      </div>
      <div className="judul-ruang-investigasi">
        <div>
          <h1 className="judul-detail">
            Pembunuhan <em>Tengah Malam.</em>
          </h1>
          <p className="detail-pembuka">
            Periksa setiap bukti, bandingkan keterangan, dan tarik kesimpulanmu
            sendiri. Semua informasi yang kamu temukan akan tercatat dalam
            jurnal investigasi.
          </p>
        </div>
        <div className="status-kasus-mini">
          <span className="titik-merah" /> KASUS AKTIF
          <strong>MM-001</strong>
        </div>
      </div>

      <section
        className="progres-investigasi"
        aria-label="Kemajuan investigasi"
      >
        <div className="progres-judul">
          <span>
            <SearchCheck size={16} /> KEMAJUAN PENYELIDIKAN
          </span>
          <strong>
            {buktiDitemukan.length} / {barangBukti.length} BUKTI DIPERIKSA
          </strong>
        </div>
        <div className="progres-jalur">
          <span style={{ width: `${persentase}%` }} />
        </div>
      </section>

      <div className="investigasi-layout">
        <aside className="navigasi-investigasi" aria-label="Menu investigasi">
          <span className="label-panel">MEJA PENYELIDIKAN</span>
          <button
            className={
              tab === "bukti" ? "tab-investigasi aktif" : "tab-investigasi"
            }
            onClick={() => setTab("bukti")}
          >
            <SearchCheck size={17} />
            <span>Barang Bukti</span>
            <strong>{buktiDitemukan.length}</strong>
          </button>
          <button
            className={
              tab === "tersangka" ? "tab-investigasi aktif" : "tab-investigasi"
            }
            onClick={() => setTab("tersangka")}
          >
            <UserRound size={17} />
            <span>Tersangka</span>
            <strong>03</strong>
          </button>
          <button
            className={
              tab === "jurnal" ? "tab-investigasi aktif" : "tab-investigasi"
            }
            onClick={() => setTab("jurnal")}
          >
            <NotebookPen size={17} />
            <span>Jurnal Kasus</span>
            <strong>{buktiDitemukan.length + (catatan.trim() ? 1 : 0)}</strong>
          </button>
          <div className="peringatan-investigasi">
            <AlertTriangle size={17} />
            <p>
              Jangan terburu-buru. Satu petunjuk belum tentu menceritakan
              seluruh kejadian.
            </p>
          </div>
          <button
            className="tombol tombol-emas tombol-tuduhan"
            onClick={() => setTab("tuduhan")}
          >
            <Gavel size={16} /> Buat Kesimpulan
          </button>
        </aside>

        <section className="panel-meja-investigasi">
          {tab === "bukti" && (
            <>
              <div className="heading-panel-investigasi">
                <div>
                  <span className="label-panel">ARSIP TKP / 04 ITEM</span>
                  <h2>Barang bukti</h2>
                </div>
                <p>Pilih berkas untuk memeriksa detailnya.</p>
              </div>
              <div className="grid-bukti">
                {barangBukti.map((bukti) => (
                  <button
                    key={bukti.id}
                    className={`kartu-bukti ${buktiDitemukan.includes(bukti.id) ? "sudah-diperiksa" : ""} ${buktiDibuka === bukti.id ? "bukti-terpilih" : ""}`}
                    onClick={() => periksaBukti(bukti)}
                  >
                    <span className="bukti-ikon">{bukti.ikon}</span>
                    <span className="bukti-id">
                      {bukti.id} · {bukti.kategori}
                    </span>
                    <strong>{bukti.nama}</strong>
                    <span className="bukti-ringkasan">{bukti.ringkasan}</span>
                    <span className="bukti-bawah">
                      {buktiDitemukan.includes(bukti.id) ? (
                        <>
                          <CheckCircle2 size={14} /> SUDAH DIPERIKSA
                        </>
                      ) : (
                        <>
                          PERIKSA BUKTI <ChevronRight size={14} />
                        </>
                      )}
                    </span>
                  </button>
                ))}
              </div>
              {buktiAktif && (
                <div className="detail-bukti-terbuka">
                  <div className="detail-bukti-heading">
                    <span className="label-panel">
                      LAPORAN PEMERIKSAAN / {buktiAktif.id}
                    </span>
                    <button
                      onClick={() => setBuktiDibuka(null)}
                      aria-label="Tutup detail bukti"
                    >
                      <X size={17} />
                    </button>
                  </div>
                  <h3>{buktiAktif.nama}</h3>
                  <p className="lokasi-bukti">
                    <MapPin size={14} /> Ditemukan di: {buktiAktif.lokasi}
                  </p>
                  <p>{buktiAktif.detail}</p>
                  <div className="temuan-bukti">
                    <SearchCheck size={16} />
                    <span>
                      <strong>CATATAN PENYELIDIK</strong>
                      {buktiAktif.petunjuk}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "tersangka" && (
            <>
              <div className="heading-panel-investigasi">
                <div>
                  <span className="label-panel">DAFTAR SUBJEK / 03 ORANG</span>
                  <h2>Profil tersangka</h2>
                </div>
                <p>Bandingkan alibi dan pernyataan mereka.</p>
              </div>
              <div className="profil-tersangka-layout">
                <div className="pilihan-tersangka">
                  {wawancaraTersangka.map((orang, index) => (
                    <button
                      key={orang.nama}
                      className={`pilihan-tersangka-item ${tersangkaDipilih === index ? "aktif" : ""}`}
                      onClick={() => setTersangkaDipilih(index)}
                    >
                      <span className={`avatar avatar-${orang.warna}`}>
                        {orang.inisial}
                      </span>
                      <span>
                        <strong>{orang.nama}</strong>
                        <small>{orang.peran}</small>
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
                <article className="kartu-interogasi">
                  <span className="label-panel">TRANSKRIP PERNYATAAN</span>
                  <div
                    className={`avatar avatar-besar avatar-${wawancaraTersangka[tersangkaDipilih].warna}`}
                  >
                    {wawancaraTersangka[tersangkaDipilih].inisial}
                  </div>
                  <h3>{wawancaraTersangka[tersangkaDipilih].nama}</h3>
                  <span className="peran-tersangka">
                    {wawancaraTersangka[tersangkaDipilih].peran}
                  </span>
                  <blockquote>
                    {wawancaraTersangka[tersangkaDipilih].pernyataan}
                  </blockquote>
                  <div className="alibi-tersangka">
                    <strong>
                      <Clock3 size={14} /> ALIBI
                    </strong>
                    <p>{wawancaraTersangka[tersangkaDipilih].alibi}</p>
                  </div>
                  <div className="catatan-tersangka">
                    <strong>CATATAN PENYELIDIK</strong>
                    <p>{wawancaraTersangka[tersangkaDipilih].catatan}</p>
                  </div>
                </article>
              </div>
            </>
          )}

          {tab === "jurnal" && (
            <>
              <div className="heading-panel-investigasi">
                <div>
                  <span className="label-panel">CATATAN PRIBADI</span>
                  <h2>Jurnal investigasi</h2>
                </div>
                <BookOpen size={23} />
              </div>
              <p className="teks-bantuan-jurnal">
                Bukti yang sudah diperiksa otomatis muncul di sini. Tambahkan
                catatanmu untuk menyimpan teori atau pertanyaan yang ingin
                ditelusuri.
              </p>
              <div className="daftar-jurnal">
                {buktiDitemukan.length === 0 && (
                  <div className="jurnal-kosong">
                    <NotebookPen size={25} />
                    <strong>Belum ada catatan bukti</strong>
                    <span>
                      Buka tab Barang Bukti dan periksa item untuk memulai
                      jurnal.
                    </span>
                    <button
                      className="tombol tombol-outline"
                      onClick={() => setTab("bukti")}
                    >
                      Periksa barang bukti
                    </button>
                  </div>
                )}
                {barangBukti
                  .filter((item) => buktiDitemukan.includes(item.id))
                  .map((item) => (
                    <article className="entri-jurnal" key={item.id}>
                      <span>{item.id}</span>
                      <div>
                        <strong>{item.nama}</strong>
                        <p>{item.petunjuk}</p>
                      </div>
                      <CheckCircle2 size={16} />
                    </article>
                  ))}
              </div>
              <label className="label-catatan" htmlFor="catatan-investigasi">
                CATATAN PENYELIDIK
              </label>
              <textarea
                id="catatan-investigasi"
                value={catatan}
                onChange={(event) => setCatatan(event.target.value)}
                placeholder="Contoh: Cocokkan waktu pengantaran teh dengan keterangan tersangka..."
                rows={4}
              />
              <button
                className="tombol tombol-emas tombol-simpan-catatan"
                onClick={simpanCatatan}
                disabled={!catatan.trim()}
              >
                <NotebookPen size={16} /> Simpan dan lihat jurnal
              </button>
              {catatan.trim() && (
                <div className="catatan-tersimpan">
                  <strong>CATATAN SAAT INI</strong>
                  <p>{catatan}</p>
                </div>
              )}
            </>
          )}

          {tab === "tuduhan" && (
            <div className="panel-tuduhan">
              <div className="ikon-tuduhan">
                <Gavel size={28} />
              </div>
              <span className="label-panel">
                TAHAP AKHIR / KEPUTUSAN PENYELIDIK
              </span>
              <h2>Siapa yang bertanggung jawab?</h2>
              <p>
                Pilih tersangka yang menurutmu paling mungkin menjadi pelaku.
                Gunakan bukti dan alibi yang sudah kamu periksa sebagai dasar
                keputusan.
              </p>
              <div className="opsi-tuduhan">
                {wawancaraTersangka.map((orang) => (
                  <button
                    key={orang.nama}
                    className={`opsi-tuduhan-item ${tuduhan === orang.nama ? "aktif" : ""}`}
                    onClick={() => {
                      setTuduhan(orang.nama);
                      setHasilTuduhan(null);
                    }}
                  >
                    <span className={`avatar avatar-${orang.warna}`}>
                      {orang.inisial}
                    </span>
                    <span>
                      <strong>{orang.nama}</strong>
                      <small>{orang.peran}</small>
                    </span>
                    <span className="radio-tuduhan" />
                  </button>
                ))}
              </div>
              <button
                className="tombol tombol-emas tombol-kirim-tuduhan"
                onClick={kirimTuduhan}
                disabled={!tuduhan}
              >
                <Gavel size={16} /> Tetapkan tersangka
              </button>
              {hasilTuduhan && (
                <div className={`hasil-tuduhan ${hasilTuduhan}`} role="status">
                  {hasilTuduhan === "benar" ? (
                    <CheckCircle2 size={21} />
                  ) : (
                    <AlertTriangle size={21} />
                  )}
                  <div>
                    <strong>
                      {hasilTuduhan === "benar"
                        ? "Kesimpulan tepat — kasus terpecahkan"
                        : "Kesimpulan belum didukung bukti"}
                    </strong>
                    <p>
                      {hasilTuduhan === "benar"
                        ? "Arthur Wells adalah pelaku dalam skenario kasus ini. Jadwal pelayanan dan minuman korban menjadi petunjuk penting. Kamu berhasil menghubungkan kesempatan dengan bukti di TKP."
                        : "Bukti yang tersedia belum cukup mendukung tuduhan tersebut. Periksa kembali barang bukti, bandingkan alibi, lalu coba simpulkan lagi."}
                    </p>
                    {hasilTuduhan === "belum" && (
                      <button
                        className="tombol tombol-outline"
                        onClick={() => {
                          setTab("bukti");
                          setHasilTuduhan(null);
                        }}
                      >
                        Kembali memeriksa bukti
                      </button>
                    )}
                  </div>
                </div>
              )}
              <p className="catatan-demo">
                Catatan: ini adalah skenario fiktif dengan alur dan jawaban yang
                telah ditentukan. Interogasi AI akan ditambahkan pada tahap
                integrasi berikutnya.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function App() {
  const [halaman, setHalaman] = useState("beranda");
  const [bagianAktif, setBagianAktif] = useState("beranda");

  function keAtas() {
    setHalaman("beranda");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="aplikasi">
      <Header
        halaman={halaman}
        bagianAktif={bagianAktif}
        setBagianAktif={setBagianAktif}
        bukaKasus={() => {
          setBagianAktif("kasus");
          setHalaman("detail");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
      {halaman === "beranda" && (
        <Beranda
          bukaKasus={() => {
            setHalaman("detail");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
      {halaman === "detail" && (
        <DetailKasus
          kembali={keAtas}
          mulai={() => {
            setHalaman("investigasi");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
      {halaman === "investigasi" && (
        <RuangInvestigasi
          kembali={() => {
            setHalaman("detail");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}
