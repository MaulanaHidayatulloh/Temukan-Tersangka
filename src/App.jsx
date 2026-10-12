import { useState } from "react";
import Header from "./components/Header.jsx";
import Beranda from "./components/Beranda.jsx";
import DetailKasus from "./components/DetailKasus.jsx";
import RuangInvestigasi from "./components/RuangInvestigasi.jsx";
import HasilAkhir from "./components/HasilAkhir.jsx";
import { KUNCI_PROGRES } from "./data/caseData.js";

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
          lihatHasil={() => {
            setHalaman("hasil");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
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
          selesai={() => {
            setHalaman("hasil");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
      {halaman === "hasil" && (
        <HasilAkhir
          kembali={keAtas}
          mainLagi={() => {
            window.localStorage.removeItem(KUNCI_PROGRES);
            setHalaman("investigasi");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}
