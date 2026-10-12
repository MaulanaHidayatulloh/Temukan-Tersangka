import {
  ArrowUpRight,
  LockKeyhole,
  Clock3,
  MapPin,
  Trophy,
} from "lucide-react";
import {
  bacaProgresTersimpan,
  kasus as kasusBawaan,
  KUNCI_PROGRES,
} from "../data/caseData.js";

export default function DetailKasus({
  kembali,
  mulai,
  lihatHasil,
  kasusAI = null,
}) {
  const kasus = kasusAI?.kasus || kasusBawaan;
  const kunciProgres = kasusAI
    ? `temukantersangka-progres-${kasusAI.id}`
    : KUNCI_PROGRES;
  const progresTersimpan = bacaProgresTersimpan(kunciProgres);
  const adaProgres = Boolean(
    progresTersimpan.buktiDitemukan?.length ||
    progresTersimpan.catatan?.trim() ||
    Object.keys(progresTersimpan.pertanyaanDijawab || {}).length ||
    progresTersimpan.hasilRelasi ||
    progresTersimpan.hasilTuduhan,
  );
  const kasusSelesai = progresTersimpan.hasilTuduhan === "benar";

  return (
    <main className="halaman-detail">
      <button className="kembali" onClick={kembali}>
        ← Kembali ke Beranda
      </button>
      <div className="label-atas">
        <span className="garis-emas" />
        BERKAS INVESTIGASI / {kasusAI?.id || "MM-001"}
      </div>
      <h1 className="judul-detail">
        {kasusAI ? (
          <>{kasus.judul}</>
        ) : (
          <>
            Pembunuhan <em>Tengah Malam.</em>
          </>
        )}
      </h1>
      <p className="detail-pembuka">
        {kasusAI
          ? kasus.tujuan
          : "Satu korban. Tiga tersangka. Sebuah rahasia yang belum terungkap."}
      </p>

      <div className="detail-grid">
        <section className="panel-detail">
          <span className="label-panel">01 / LAPORAN AWAL</span>
          <h2>
            {kasusAI
              ? `Laporan awal: ${kasus.lokasi}`
              : "Insiden di Blackwood Manor"}
          </h2>
          <p>{kasus.deskripsi}</p>
          <p>{kasus.tujuan}</p>
          <div className="detail-metadata">
            <span>
              <MapPin size={15} /> {kasus.lokasi}
            </span>
            <span>
              <Clock3 size={15} /> {kasus.waktu}
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
          <h2>
            {kasus.tersangka.length} orang. {kasus.tersangka.length} cerita.
          </h2>
          <div className="daftar-tersangka">
            {kasus.tersangka.map((orang, index) => (
              <article className="tersangka" key={orang.inisial}>
                <div className={`avatar avatar-foto avatar-${orang.warna}`}>
                  <img
                    src={orang.foto}
                    alt={`Foto ${orang.nama}`}
                    loading="lazy"
                  />
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
          <h2>
            {kasusSelesai
              ? "Kasus ini telah terpecahkan."
              : adaProgres
                ? "Lanjutkan penyelidikan?"
                : "Siap membuka penyelidikan?"}
          </h2>
          <p>
            {kasusSelesai
              ? "Progres kasus tersimpan di perangkat ini. Kamu tetap bisa membuka ruang investigasi untuk meninjau kembali bukti."
              : adaProgres
                ? "Progres terakhir ditemukan. Lanjutkan dari bukti dan catatan yang sudah kamu kumpulkan."
                : "Masuk ke ruang investigasi untuk mulai mengumpulkan bukti."}
          </p>
        </div>
        <div className="aksi-detail-kasus">
          {kasusSelesai && (
            <button className="tombol tombol-outline" onClick={lihatHasil}>
              Lihat Hasil Akhir <Trophy size={16} />
            </button>
          )}
          <button className="tombol tombol-emas" onClick={mulai}>
            {kasusSelesai
              ? "Tinjau Investigasi"
              : adaProgres
                ? "Lanjutkan Investigasi"
                : "Buka Ruang Investigasi"}{" "}
            <ArrowUpRight size={17} />
          </button>
        </div>
      </div>
    </main>
  );
}
