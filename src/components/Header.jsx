import { Fingerprint } from "lucide-react";
import Logo from "./Logo.jsx";

export default function Header({
  bukaKasus,
  halaman,
  bagianAktif,
  setBagianAktif,
}) {
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
