export default function Logo({ kecil = false }) {
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
