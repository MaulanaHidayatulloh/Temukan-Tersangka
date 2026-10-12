import {
  CheckCircle2,
  GitBranch,
  MessageCircleQuestion,
  Trophy,
  Medal,
  RotateCcw,
  ArrowLeft,
  ClipboardCheck,
} from "lucide-react";
import {
  bacaRekorTerbaik,
  tentukanPeringkat,
  bacaProgresTersimpan,
  kasus,
  barangBukti,
} from "../data/caseData.js";

export default function HasilAkhir({ kembali, mainLagi }) {
  const progres = bacaProgresTersimpan();
  const jumlahPertanyaan = Object.keys(progres.pertanyaanDijawab || {}).filter(
    (kunci) => progres.pertanyaanDijawab[kunci],
  ).length;
  const buktiDitemukan = progres.buktiDitemukan || [];
  const skor =
    buktiDitemukan.length * 100 +
    jumlahPertanyaan * 40 +
    (progres.hasilRelasi ? 100 : 0) +
    (progres.hasilTuduhan === "benar" ? 500 : 0);
  const peringkat = tentukanPeringkat(skor);
  const rekor = bacaRekorTerbaik();
  const daftarBukti = buktiDitemukan
    .map((id) => barangBukti.find((bukti) => bukti.id === id))
    .filter(Boolean);

  return (
    <main className="halaman-detail halaman-hasil-akhir">
      <button className="kembali" onClick={kembali}>
        <ArrowLeft size={15} /> Kembali ke Beranda
      </button>
      <div className="hasil-hero">
        <div className="hasil-lencana">
          <Trophy size={30} />
        </div>
        <span className="label-panel">LAPORAN PENUTUP / MM-001</span>
        <h1 className="judul-detail">
          Kasus <em>Terpecahkan.</em>
        </h1>
        <p className="detail-pembuka">
          Penyelidikan Pembunuhan Tengah Malam telah selesai. Berikut ringkasan
          pencapaianmu sebagai penyelidik.
        </p>
        <div className="hasil-skor-besar">
          <span>SKOR AKHIR</span>
          <strong>{skor.toLocaleString("id-ID")}</strong>
          <small>
            Rekor terbaik: {Math.max(rekor, skor).toLocaleString("id-ID")} poin
          </small>
        </div>
      </div>

      <section className="hasil-ringkasan-grid">
        <article className="hasil-kartu-stat">
          <ClipboardCheck size={20} />
          <span>BUKTI DIPERIKSA</span>
          <strong>
            {buktiDitemukan.length}
            <small> / {barangBukti.length}</small>
          </strong>
        </article>
        <article className="hasil-kartu-stat">
          <MessageCircleQuestion size={20} />
          <span>PERTANYAAN DIAJUKAN</span>
          <strong>{jumlahPertanyaan}</strong>
        </article>
        <article className="hasil-kartu-stat">
          <GitBranch size={20} />
          <span>ANALISIS DILAKUKAN</span>
          <strong>{progres.hasilRelasi ? "1" : "0"}</strong>
        </article>
      </section>

      <section className="hasil-peringkat panel-detail">
        <div className="hasil-peringkat-ikon">
          <Medal size={28} />
        </div>
        <div>
          <span className="label-panel">PERINGKAT DETEKTIF</span>
          <h2>{peringkat.nama}</h2>
          <p>{peringkat.deskripsi}</p>
        </div>
        <span className="hasil-status-selesai">
          <CheckCircle2 size={15} /> SELESAI
        </span>
      </section>

      <section className="hasil-bukti panel-detail">
        <span className="label-panel">CATATAN PENUTUP</span>
        <h2>Bukti yang kamu kumpulkan</h2>
        {daftarBukti.length ? (
          <ul>
            {daftarBukti.map((bukti) => (
              <li key={bukti.id}>
                <span>{bukti.ikon}</span>
                <div>
                  <strong>{bukti.nama}</strong>
                  <small>{bukti.lokasi}</small>
                </div>
                <CheckCircle2 size={16} />
              </li>
            ))}
          </ul>
        ) : (
          <p>Belum ada barang bukti yang tercatat pada penyelidikan ini.</p>
        )}
        <div className="hasil-kesimpulan">
          <strong>Kesimpulan kasus</strong>
          <p>
            Arthur Wells adalah pelaku dalam skenario fiktif MM-001. Jadwal
            pelayanan dan cangkir teh menjadi petunjuk penting untuk mengungkap
            kesempatan dan cara kejadian.
          </p>
        </div>
      </section>

      <div className="hasil-aksi">
        <div>
          <span className="label-panel">LANGKAH SELANJUTNYA</span>
          <h2>Siap menguji kembali deduksimu?</h2>
          <p>
            Mulai ulang untuk menyelidiki kasus ini dari awal dan mencoba
            strategi berbeda.
          </p>
        </div>
        <button className="tombol tombol-emas" onClick={mainLagi}>
          <RotateCcw size={16} /> Mainkan Ulang Kasus
        </button>
      </div>
    </main>
  );
}
