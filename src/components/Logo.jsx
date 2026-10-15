export default function Logo({ kecil = false }) {
  return (
    <a
      className={`logo ${kecil ? "logo-kecil" : ""}`}
      href="/"
      aria-label="TemukanTersangka — Beranda"
    >
      <span className="logo-simbol">
        <img
          src="../../public/icon_TemukanTersangka.svg"
          alt=""
          aria-hidden="true"
        />
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
