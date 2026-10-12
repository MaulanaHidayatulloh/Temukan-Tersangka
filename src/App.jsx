import { useState } from "react";
import Header from "./components/Header.jsx";
import Beranda from "./components/Beranda.jsx";
import DetailKasus from "./components/DetailKasus.jsx";
import RuangInvestigasi from "./components/RuangInvestigasi.jsx";
import HasilAkhir from "./components/HasilAkhir.jsx";
import CaseGenerator from "./components/CaseGenerator.jsx";
import { KUNCI_PROGRES } from "./data/caseData.js";

export default function App() {
  const [halaman, setHalaman] = useState("beranda");
  const [bagianAktif, setBagianAktif] = useState("beranda");
  const [kasusAI, setKasusAI] = useState(null);
  function keAtas() {
    setHalaman("beranda");
    setKasusAI(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function bukaGenerator() {
    setBagianAktif("kasus");
    setHalaman("generator");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function mainkanKasusAI(item) {
    setKasusAI(item);
    setHalaman("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function mulaiUlang() {
    if (kasusAI)
      window.localStorage.removeItem(`temukantersangka-progres-${kasusAI.id}`);
    else window.localStorage.removeItem(KUNCI_PROGRES);
    setHalaman("investigasi");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return (
    <div className="aplikasi">
      <Header
        halaman={halaman}
        bagianAktif={bagianAktif}
        setBagianAktif={setBagianAktif}
        bukaKasus={() => {
          setKasusAI(null);
          setBagianAktif("kasus");
          setHalaman("detail");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
      {halaman === "beranda" && (
        <Beranda
          bukaKasus={() => {
            setKasusAI(null);
            setHalaman("detail");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          bukaGenerator={bukaGenerator}
        />
      )}
      {halaman === "generator" && (
        <CaseGenerator kembali={keAtas} mainkan={mainkanKasusAI} />
      )}
      {halaman === "detail" && (
        <DetailKasus
          key={kasusAI?.id || "MM-001"}
          kasusAI={kasusAI}
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
          key={kasusAI?.id || "MM-001"}
          kasusAI={kasusAI}
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
          key={kasusAI?.id || "MM-001"}
          kasusAI={kasusAI}
          kembali={keAtas}
          mainLagi={mulaiUlang}
        />
      )}
    </div>
  );
}
