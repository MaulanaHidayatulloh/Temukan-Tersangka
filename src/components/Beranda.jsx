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
} from "lucide-react";
import { kasus } from "../data/caseData.js";
import IlustrasiKasus from "./IlustrasiKasus.jsx";
import Logo from "./Logo";

export default function Beranda({ bukaKasus }) {
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
