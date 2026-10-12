import { useEffect, useState } from "react";
import {
  Clock3,
  MapPin,
  ChevronRight,
  X,
  UserRound,
  BookOpen,
  SearchCheck,
  CheckCircle2,
  AlertTriangle,
  NotebookPen,
  Gavel,
  GitBranch,
  MessageCircleQuestion,
  Trophy,
  Medal,
  Bot,
  Send,
  Sparkles,
  LoaderCircle,
} from "lucide-react";
import MarkdownText from "./MarkdownText.jsx";
import {
  KUNCI_PROGRES,
  KUNCI_REKOR,
  bacaRekorTerbaik,
  tentukanPeringkat,
  bacaProgresTersimpan,
  kasus as kasusBawaan,
  barangBukti as barangBuktiBawaan,
  wawancaraTersangka as wawancaraTersangkaBawaan,
  pertanyaanInterogasi as pertanyaanInterogasiBawaan,
  hubunganBukti as hubunganBuktiBawaan,
} from "../data/caseData.js";

export default function RuangInvestigasi({ kembali, selesai, kasusAI = null }) {
  const kasus = kasusAI?.kasus || kasusBawaan;
  const barangBukti = kasusAI?.barangBukti || barangBuktiBawaan;
  const wawancaraTersangka =
    kasusAI?.wawancaraTersangka || wawancaraTersangkaBawaan;
  const pertanyaanInterogasi =
    kasusAI?.pertanyaanInterogasi || pertanyaanInterogasiBawaan;
  const hubunganBukti = kasusAI?.hubunganBukti || hubunganBuktiBawaan;
  const kunciProgresAktif = kasusAI
    ? `temukantersangka-progres-${kasusAI.id}`
    : KUNCI_PROGRES;
  const kunciRekorAktif = kasusAI
    ? `temukantersangka-rekor-${kasusAI.id}`
    : KUNCI_REKOR;
  const bacaProgresAktif = () => bacaProgresTersimpan(kunciProgresAktif);
  const pelakuResmi = kasusAI
    ? wawancaraTersangka.find(
        (orang) => orang.id === kasusAI.solusiRahasia.pelakuId,
      )?.nama
    : "Arthur Wells";
  const [tab, setTab] = useState(() => bacaProgresAktif().tab || "bukti");
  const [buktiDibuka, setBuktiDibuka] = useState(
    () => bacaProgresAktif().buktiDibuka || null,
  );
  const [buktiDitemukan, setBuktiDitemukan] = useState(
    () => bacaProgresAktif().buktiDitemukan || [],
  );
  const [tersangkaDipilih, setTersangkaDipilih] = useState(
    () => bacaProgresAktif().tersangkaDipilih ?? 0,
  );
  const [catatan, setCatatan] = useState(
    () => bacaProgresAktif().catatan || "",
  );
  const [tuduhan, setTuduhan] = useState(
    () => bacaProgresAktif().tuduhan || "",
  );
  const [hasilTuduhan, setHasilTuduhan] = useState(
    () => bacaProgresAktif().hasilTuduhan || null,
  );
  const [buktiRelasiA, setBuktiRelasiA] = useState(
    () => bacaProgresAktif().buktiRelasiA || "",
  );
  const [buktiRelasiB, setBuktiRelasiB] = useState(
    () => bacaProgresAktif().buktiRelasiB || "",
  );
  const [hasilRelasi, setHasilRelasi] = useState(
    () => bacaProgresAktif().hasilRelasi || null,
  );
  const [pertanyaanDijawab, setPertanyaanDijawab] = useState(
    () => bacaProgresAktif().pertanyaanDijawab || {},
  );
  const [jawabanAktif, setJawabanAktif] = useState(
    () => bacaProgresAktif().jawabanAktif || null,
  );
  const [rekorTerbaik, setRekorTerbaik] = useState(() =>
    bacaRekorTerbaik(kunciRekorAktif),
  );
  const [riwayatAI, setRiwayatAI] = useState(
    () => bacaProgresAktif().riwayatAI || { 0: [], 1: [], 2: [] },
  );
  const [inputAI, setInputAI] = useState("");
  const [memuatAI, setMemuatAI] = useState(false);
  const [errorAI, setErrorAI] = useState("");
  const [hasilAnalisisAI, setHasilAnalisisAI] = useState(
    () => bacaProgresAktif().hasilAnalisisAI || "",
  );
  const [memuatAnalisisAI, setMemuatAnalisisAI] = useState(false);

  const jumlahPertanyaanDijawab = Object.keys(pertanyaanDijawab).filter(
    (kunci) => pertanyaanDijawab[kunci],
  ).length;
  const skor =
    buktiDitemukan.length * 100 +
    jumlahPertanyaanDijawab * 40 +
    (hasilRelasi ? 100 : 0) +
    (hasilTuduhan === "benar" ? 500 : 0);
  const peringkat = tentukanPeringkat(skor);
  const progresPeringkat = peringkat.berikutnya
    ? Math.min(
        100,
        Math.round(
          ((skor - peringkat.ambang) /
            (peringkat.berikutnya - peringkat.ambang)) *
            100,
        ),
      )
    : 100;

  useEffect(() => {
    const progres = {
      tab,
      buktiDibuka,
      buktiDitemukan,
      tersangkaDipilih,
      catatan,
      tuduhan,
      hasilTuduhan,
      buktiRelasiA,
      buktiRelasiB,
      hasilRelasi,
      pertanyaanDijawab,
      jawabanAktif,
      riwayatAI,
      hasilAnalisisAI,
      diperbaruiPada: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(kunciProgresAktif, JSON.stringify(progres));
    } catch {
      // Investigasi tetap dapat digunakan jika penyimpanan browser tidak tersedia.
    }
  }, [
    tab,
    buktiDibuka,
    buktiDitemukan,
    tersangkaDipilih,
    catatan,
    tuduhan,
    hasilTuduhan,
    buktiRelasiA,
    buktiRelasiB,
    hasilRelasi,
    pertanyaanDijawab,
    jawabanAktif,
    riwayatAI,
    hasilAnalisisAI,
    kunciProgresAktif,
  ]);

  useEffect(() => {
    if (skor > bacaRekorTerbaik(kunciRekorAktif)) {
      try {
        window.localStorage.setItem(kunciRekorAktif, String(skor));
      } catch {
        // Skor sesi tetap berjalan meskipun penyimpanan rekor tidak tersedia.
      }
    }
  }, [skor, kunciRekorAktif]);

  function resetInvestigasi() {
    if (
      !window.confirm(
        `Mulai ulang investigasi ${kasusAI?.id || "MM-001"}? Semua bukti, analisis, jawaban interogasi, dan catatan yang tersimpan akan dihapus.`,
      )
    )
      return;
    setRekorTerbaik(
      Math.max(rekorTerbaik, skor, bacaRekorTerbaik(kunciRekorAktif)),
    );
    window.localStorage.removeItem(kunciProgresAktif);
    setTab("bukti");
    setBuktiDibuka(null);
    setBuktiDitemukan([]);
    setTersangkaDipilih(0);
    setCatatan("");
    setTuduhan("");
    setHasilTuduhan(null);
    setBuktiRelasiA("");
    setBuktiRelasiB("");
    setHasilRelasi(null);
    setPertanyaanDijawab({});
    setJawabanAktif(null);
    setRiwayatAI({ 0: [], 1: [], 2: [] });
    setHasilAnalisisAI("");
    setInputAI("");
    setErrorAI("");
  }

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

  async function kirimInterogasiAI(event) {
    event?.preventDefault();
    const pertanyaan = inputAI.trim();
    if (!pertanyaan || memuatAI) return;

    const idTersangka = String(tersangkaDipilih);
    const riwayatSebelumnya = riwayatAI[idTersangka] || [];
    const riwayatBaru = [
      ...riwayatSebelumnya,
      { role: "user", text: pertanyaan },
    ];
    setRiwayatAI((sebelumnya) => ({
      ...sebelumnya,
      [idTersangka]: riwayatBaru,
    }));
    setInputAI("");
    setErrorAI("");
    setMemuatAI(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "interrogate",
          suspectName: wawancaraTersangka[tersangkaDipilih].nama,
          question: pertanyaan,
          history: riwayatSebelumnya,
          evidence: barangBukti
            .filter((item) => buktiDitemukan.includes(item.id))
            .map(({ id, nama, detail, petunjuk }) => ({
              id,
              nama,
              detail,
              petunjuk,
            })),
          notes: catatan,
          caseContext: kasusAI
            ? {
                judul: kasus.judul,
                deskripsi: kasus.deskripsi,
                tersangka: wawancaraTersangka.map(
                  ({ nama, peran, alibi, pernyataan }) => ({
                    nama,
                    peran,
                    alibi,
                    pernyataan,
                  }),
                ),
                bukti: barangBukti
                  .filter((item) => buktiDitemukan.includes(item.id))
                  .map(({ id, nama, detail }) => ({ id, nama, detail })),
              }
            : undefined,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          data.error || "AI belum dapat menjawab. Periksa konfigurasi server.",
        );
      setRiwayatAI((sebelumnya) => ({
        ...sebelumnya,
        [idTersangka]: [...riwayatBaru, { role: "model", text: data.answer }],
      }));
    } catch (error) {
      setErrorAI(
        error instanceof TypeError
          ? "Tidak dapat terhubung ke server AI. Pastikan terminal backend menjalankan `npm run server`."
          : error.message || "Gagal menghubungi AI.",
      );
    } finally {
      setMemuatAI(false);
    }
  }

  async function analisisDenganAI() {
    if (memuatAnalisisAI) return;
    setMemuatAnalisisAI(true);
    setErrorAI("");
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "analyze",
          evidence: barangBukti
            .filter((item) => buktiDitemukan.includes(item.id))
            .map(({ id, nama, detail, petunjuk }) => ({
              id,
              nama,
              detail,
              petunjuk,
            })),
          suspects: wawancaraTersangka.map(
            ({ nama, peran, alibi, pernyataan, catatan }) => ({
              nama,
              peran,
              alibi,
              pernyataan,
              catatan,
            }),
          ),
          notes: catatan,
          selectedEvidence: [buktiRelasiA, buktiRelasiB].filter(Boolean),
          caseContext: kasusAI
            ? {
                judul: kasus.judul,
                deskripsi: kasus.deskripsi,
                tersangka: wawancaraTersangka.map(
                  ({ nama, peran, alibi, pernyataan }) => ({
                    nama,
                    peran,
                    alibi,
                    pernyataan,
                  }),
                ),
                bukti: barangBukti
                  .filter((item) => buktiDitemukan.includes(item.id))
                  .map(({ id, nama, detail }) => ({ id, nama, detail })),
              }
            : undefined,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.error || "AI belum dapat menganalisis bukti.");
      setHasilAnalisisAI(data.answer);
    } catch (error) {
      setErrorAI(
        error instanceof TypeError
          ? "Tidak dapat terhubung ke server AI. Pastikan terminal backend menjalankan `npm run server`."
          : error.message || "Gagal menghubungi AI.",
      );
    } finally {
      setMemuatAnalisisAI(false);
    }
  }

  function kirimTuduhan() {
    if (!tuduhan) return;
    setHasilTuduhan(tuduhan === pelakuResmi ? "benar" : "belum");
  }

  return (
    <main className="halaman-detail halaman-ruang-investigasi">
      <button className="kembali" onClick={kembali}>
        ← Kembali ke Berkas
      </button>
      <div className="label-atas">
        <span className="garis-emas" />
        RUANG INVESTIGASI / {kasusAI?.id || "MM-001"}
      </div>
      <div className="judul-ruang-investigasi">
        <div>
          <h1 className="judul-detail">
            {kasusAI ? (
              kasus.judul
            ) : (
              <>
                Pembunuhan <em>Tengah Malam.</em>
              </>
            )}
          </h1>
          <p className="detail-pembuka">
            Periksa setiap bukti, bandingkan keterangan, dan tarik kesimpulanmu
            sendiri. Semua informasi yang kamu temukan akan tercatat dalam
            jurnal investigasi.
          </p>
        </div>
        <div className="status-kasus-mini">
          <span
            className={`titik-merah ${hasilTuduhan === "benar" ? "titik-kasus-selesai" : ""}`}
          />
          {hasilTuduhan === "benar"
            ? "KASUS SELESAI"
            : buktiDitemukan.length
              ? "SEDANG DISELIDIKI"
              : "BELUM DIMULAI"}
          <strong>{kasusAI?.id || "MM-001"}</strong>
        </div>
      </div>

      <div className="penyimpanan-progres">
        <span>
          <CheckCircle2 size={15} /> Progres tersimpan otomatis di perangkat ini
        </span>
        <button
          type="button"
          className="tombol-reset-progres"
          onClick={resetInvestigasi}
        >
          Mulai ulang investigasi
        </button>
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

      <section
        className="panel-peringkat-detektif"
        aria-label="Skor dan peringkat detektif"
      >
        <div className="peringkat-emblem">
          <Trophy size={22} />
        </div>
        <div className="peringkat-info">
          <span className="label-panel">PERINGKAT DETEKTIF</span>
          <h2>{peringkat.nama}</h2>
          <p>{peringkat.deskripsi}</p>
          <div className="peringkat-jalur">
            <span style={{ width: `${progresPeringkat}%` }} />
          </div>
          <small>
            {peringkat.berikutnya
              ? `${Math.max(0, peringkat.berikutnya - skor)} poin menuju peringkat berikutnya`
              : "Peringkat tertinggi telah dicapai"}
          </small>
        </div>
        <div className="skor-info">
          <span>SKOR SAAT INI</span>
          <strong>{skor.toLocaleString("id-ID")}</strong>
          <small>
            <Medal size={13} /> Rekor:{" "}
            {Math.max(rekorTerbaik, skor).toLocaleString("id-ID")}
          </small>
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
              tab === "analisis" ? "tab-investigasi aktif" : "tab-investigasi"
            }
            onClick={() => setTab("analisis")}
          >
            <GitBranch size={17} />
            <span>Analisis Bukti</span>
            <strong>{hasilRelasi ? "01" : "—"}</strong>
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
          <button
            className={
              tab === "ai" ? "tab-investigasi aktif" : "tab-investigasi"
            }
            onClick={() => setTab("ai")}
          >
            <Bot size={17} />
            <span>Asisten AI</span>
            <strong>AI</strong>
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
                      <span
                        className={`avatar avatar-foto avatar-${orang.warna}`}
                      >
                        <img
                          src={orang.foto}
                          alt={`Foto ${orang.nama}`}
                          loading="lazy"
                        />
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
                    className={`avatar avatar-foto avatar-besar avatar-${wawancaraTersangka[tersangkaDipilih].warna}`}
                  >
                    <img
                      src={wawancaraTersangka[tersangkaDipilih].foto}
                      alt={`Foto ${wawancaraTersangka[tersangkaDipilih].nama}`}
                      loading="lazy"
                    />
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
                  <div className="bagian-interogasi">
                    <div className="subjudul-interogasi">
                      <MessageCircleQuestion size={16} />
                      <span>
                        <strong>AJUKAN PERTANYAAN</strong>
                        <small>
                          Pilih pertanyaan untuk menggali keterangan lebih jauh.
                        </small>
                      </span>
                    </div>
                    {pertanyaanInterogasi[tersangkaDipilih].map((item) => {
                      const kunciJawaban = `${tersangkaDipilih}-${item.id}`;
                      const sudahDijawab = Boolean(
                        pertanyaanDijawab[kunciJawaban],
                      );
                      return (
                        <div className="pertanyaan-interogasi" key={item.id}>
                          <button
                            className="tombol-pertanyaan"
                            onClick={() => {
                              setJawabanAktif(kunciJawaban);
                              setPertanyaanDijawab((sebelumnya) => ({
                                ...sebelumnya,
                                [kunciJawaban]: true,
                              }));
                            }}
                          >
                            <span>{item.pertanyaan}</span>
                            <ChevronRight size={15} />
                          </button>
                          {jawabanAktif === kunciJawaban && (
                            <div className="jawaban-interogasi">
                              <span className="label-panel">
                                JAWABAN TERSANGKA
                              </span>
                              <p>{item.jawaban}</p>
                              <div>
                                <strong>CATATAN PENYELIDIK</strong>
                                <p>{item.catatan}</p>
                              </div>
                            </div>
                          )}
                          {sudahDijawab && jawabanAktif !== kunciJawaban && (
                            <span className="pertanyaan-selesai">
                              PERTANYAAN SUDAH DIAJUKAN
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
                <div className="interogasi-ai interogasi-ai-sidebar">
                  <div className="subjudul-interogasi">
                    <Bot size={17} />
                    <span>
                      <strong>INTEROGASI BEBAS DENGAN AI</strong>
                      <small>
                        Tanyakan apa pun kepada tersangka ini. Jawaban dibuat
                        Gemini berdasarkan skenario dan bukti yang sudah kamu
                        temukan.
                      </small>
                    </span>
                  </div>
                  <div className="riwayat-chat-ai" aria-live="polite">
                    {(riwayatAI[String(tersangkaDipilih)] || []).length ===
                      0 && (
                      <p className="chat-ai-kosong">
                        Belum ada pertanyaan bebas. Coba tanyakan tentang alibi,
                        motif, atau hubungan tersangka dengan barang bukti.
                      </p>
                    )}
                    {(riwayatAI[String(tersangkaDipilih)] || []).map(
                      (pesan, index) => (
                        <div
                          className={`pesan-ai ${pesan.role === "user" ? "pesan-ai-pengguna" : "pesan-ai-model"}`}
                          key={`${pesan.role}-${index}`}
                        >
                          <span>
                            {pesan.role === "user"
                              ? "KAMU"
                              : wawancaraTersangka[
                                  tersangkaDipilih
                                ].nama.toUpperCase()}
                          </span>
                          <MarkdownText>{pesan.text}</MarkdownText>
                        </div>
                      ),
                    )}
                    {memuatAI && (
                      <div className="status-ai-memuat">
                        <LoaderCircle size={15} className="ikon-berputar" />{" "}
                        Gemini sedang menyusun jawaban...
                      </div>
                    )}
                  </div>
                  <form
                    className="form-interogasi-ai"
                    onSubmit={kirimInterogasiAI}
                  >
                    <textarea
                      value={inputAI}
                      onChange={(event) => setInputAI(event.target.value)}
                      placeholder={`Tanyakan sesuatu kepada ${wawancaraTersangka[tersangkaDipilih].nama}...`}
                      rows={2}
                      maxLength={1200}
                      disabled={memuatAI}
                    />
                    <button
                      className="tombol tombol-emas"
                      type="submit"
                      disabled={!inputAI.trim() || memuatAI}
                    >
                      <Send size={15} /> Kirim
                    </button>
                  </form>
                  {errorAI && (
                    <p className="pesan-error-ai" role="alert">
                      {errorAI}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === "ai" && (
            <section className="panel-asisten-ai">
              <div className="heading-panel-investigasi">
                <div>
                  <span className="label-panel">UNIT ANALISIS DIGITAL</span>
                  <h2>Asisten investigasi AI</h2>
                </div>
                <Sparkles size={24} />
              </div>
              <p className="teks-bantuan-jurnal">
                Gunakan Gemini untuk menelaah bukti yang sudah kamu periksa. AI
                akan membedakan fakta, dugaan, dan hal yang masih perlu
                dibuktikan.
              </p>
              <div className="ringkasan-ai-konteks">
                <strong>KONTEKS YANG DIKIRIM</strong>
                <span>{buktiDitemukan.length} barang bukti diperiksa</span>
                <span>{wawancaraTersangka.length} profil tersangka</span>
                <span>
                  {catatan.trim()
                    ? "Jurnal penyelidik disertakan"
                    : "Belum ada catatan pribadi"}
                </span>
              </div>
              <button
                className="tombol tombol-emas tombol-analisis"
                onClick={analisisDenganAI}
                disabled={memuatAnalisisAI || buktiDitemukan.length === 0}
              >
                {memuatAnalisisAI ? (
                  <>
                    <LoaderCircle size={16} className="ikon-berputar" />{" "}
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Analisis bukti dengan Gemini AI
                  </>
                )}
              </button>
              {errorAI && (
                <p className="pesan-error-ai" role="alert">
                  {errorAI}
                </p>
              )}
              {hasilAnalisisAI && (
                <article className="hasil-analisis-ai">
                  <span className="label-panel">LAPORAN ANALISIS AI</span>
                  <MarkdownText>{hasilAnalisisAI}</MarkdownText>
                  <button
                    className="tombol tombol-outline"
                    onClick={() => {
                      setCatatan(
                        (sebelumnya) =>
                          `${sebelumnya.trim()}${sebelumnya.trim() ? "\n\n" : ""}Laporan Gemini AI:\n${hasilAnalisisAI}`,
                      );
                      setTab("jurnal");
                    }}
                  >
                    Simpan laporan ke jurnal
                  </button>
                </article>
              )}
              {buktiDitemukan.length === 0 && (
                <div className="peringatan-relasi">
                  <AlertTriangle size={17} />
                  <p>
                    Periksa setidaknya satu barang bukti sebelum meminta
                    analisis AI.
                  </p>
                  <button
                    className="tombol tombol-outline"
                    onClick={() => setTab("bukti")}
                  >
                    Buka barang bukti
                  </button>
                </div>
              )}
              <p className="catatan-demo">
                Analisis AI adalah bantuan deduksi untuk skenario fiktif.
                Periksa kembali setiap kesimpulan dengan fakta kasus.
              </p>
            </section>
          )}

          {tab === "analisis" && (
            <div className="panel-analisis-bukti">
              <div className="heading-panel-investigasi">
                <div>
                  <span className="label-panel">LABORATORIUM PETUNJUK</span>
                  <h2>Analisis hubungan bukti</h2>
                </div>
                <GitBranch size={24} />
              </div>
              <p className="teks-bantuan-jurnal">
                Pilih dua barang bukti yang sudah kamu periksa. Bandingkan
                informasi keduanya untuk melihat apakah hubungan itu kuat, hanya
                mendukung teori, atau masih membutuhkan bukti tambahan.
              </p>
              <div className="pilihan-relasi-bukti">
                <label>
                  <span>BUKTI PERTAMA</span>
                  <select
                    value={buktiRelasiA}
                    onChange={(event) => {
                      setBuktiRelasiA(event.target.value);
                      setHasilRelasi(null);
                    }}
                  >
                    <option value="">Pilih bukti...</option>
                    {barangBukti
                      .filter((item) => buktiDitemukan.includes(item.id))
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.id} — {item.nama}
                        </option>
                      ))}
                  </select>
                </label>
                <span className="simbol-relasi">
                  <GitBranch size={20} />
                </span>
                <label>
                  <span>BUKTI KEDUA</span>
                  <select
                    value={buktiRelasiB}
                    onChange={(event) => {
                      setBuktiRelasiB(event.target.value);
                      setHasilRelasi(null);
                    }}
                  >
                    <option value="">Pilih bukti...</option>
                    {barangBukti
                      .filter(
                        (item) =>
                          buktiDitemukan.includes(item.id) &&
                          item.id !== buktiRelasiA,
                      )
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.id} — {item.nama}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              {buktiDitemukan.length < 2 && (
                <div className="peringatan-relasi">
                  <AlertTriangle size={17} />
                  <p>
                    Periksa minimal dua barang bukti di tab Barang Bukti sebelum
                    menganalisis hubungan.
                  </p>
                  <button
                    className="tombol tombol-outline"
                    onClick={() => setTab("bukti")}
                  >
                    Buka barang bukti
                  </button>
                </div>
              )}
              <button
                className="tombol tombol-emas tombol-analisis"
                disabled={
                  !buktiRelasiA ||
                  !buktiRelasiB ||
                  buktiRelasiA === buktiRelasiB ||
                  !buktiDitemukan.includes(buktiRelasiA) ||
                  !buktiDitemukan.includes(buktiRelasiB)
                }
                onClick={() => {
                  const ids = [buktiRelasiA, buktiRelasiB].sort();
                  const kunci = ids.join("|");
                  const hasil = hubunganBukti[kunci];
                  setHasilRelasi(
                    hasil || {
                      judul: "Hubungan belum ditemukan",
                      status: "butuh-bukti",
                      label: "BELUM ADA KESIMPULAN",
                      isi: "Kombinasi ini belum memiliki hubungan yang dapat disimpulkan dari catatan kasus. Jangan memaksakan teori; cari bukti tambahan atau bandingkan dengan keterangan tersangka.",
                    },
                  );
                }}
              >
                <GitBranch size={16} /> Analisis hubungan
              </button>
              {hasilRelasi && (
                <article className={`hasil-relasi ${hasilRelasi.status}`}>
                  <span className="label-panel">{hasilRelasi.label}</span>
                  <h3>{hasilRelasi.judul}</h3>
                  <p>{hasilRelasi.isi}</p>
                  <div className="relasi-pasangan">
                    <span>
                      {
                        barangBukti.find((item) => item.id === buktiRelasiA)
                          ?.nama
                      }
                    </span>
                    <GitBranch size={17} />
                    <span>
                      {
                        barangBukti.find((item) => item.id === buktiRelasiB)
                          ?.nama
                      }
                    </span>
                  </div>
                  <button
                    className="tombol tombol-outline"
                    onClick={() => {
                      setCatatan(
                        (sebelumnya) =>
                          `${sebelumnya ? `${sebelumnya.trim()}\n\n` : ""}Analisis ${buktiRelasiA} + ${buktiRelasiB}: ${hasilRelasi.judul}. ${hasilRelasi.isi}`,
                      );
                      setTab("jurnal");
                    }}
                  >
                    Simpan analisis ke jurnal
                  </button>
                </article>
              )}
              <button
                className="tombol tombol-emas tombol-analisis-ai"
                onClick={analisisDenganAI}
                disabled={memuatAnalisisAI || buktiDitemukan.length === 0}
              >
                {memuatAnalisisAI ? (
                  <>
                    <LoaderCircle size={16} className="ikon-berputar" />{" "}
                    Menganalisis dengan Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Minta analisis Gemini AI
                  </>
                )}
              </button>
              {hasilAnalisisAI && (
                <article className="hasil-analisis-ai">
                  <span className="label-panel">LAPORAN ANALISIS AI</span>
                  <MarkdownText>{hasilAnalisisAI}</MarkdownText>
                  <button
                    className="tombol tombol-outline"
                    onClick={() => {
                      setCatatan(
                        (sebelumnya) =>
                          `${sebelumnya.trim()}${sebelumnya.trim() ? "\n\n" : ""}Laporan Gemini AI:\n${hasilAnalisisAI}`,
                      );
                      setTab("jurnal");
                    }}
                  >
                    Simpan laporan ke jurnal
                  </button>
                </article>
              )}
              {errorAI && (
                <p className="pesan-error-ai" role="alert">
                  {errorAI}
                </p>
              )}
              <div className="catatan-demo">
                Analisis aturan kasus tetap tersedia sebagai pembanding. Untuk
                analisis dinamis, gunakan Gemini AI.
              </div>
            </div>
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
                    <span
                      className={`avatar avatar-foto avatar-${orang.warna}`}
                    >
                      <img
                        src={orang.foto}
                        alt={`Foto ${orang.nama}`}
                        loading="lazy"
                      />
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
                        ? `${pelakuResmi} adalah pelaku dalam skenario kasus ini. Kamu berhasil menghubungkan bukti dan keterangan tersangka untuk memecahkan kasus.`
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
                    {hasilTuduhan === "benar" && (
                      <button
                        className="tombol tombol-emas tombol-lihat-hasil"
                        onClick={selesai}
                      >
                        <Trophy size={16} /> Lihat Hasil Akhir
                      </button>
                    )}
                  </div>
                </div>
              )}
              <p className="catatan-demo">
                Interogasi bebas menggunakan Gemini AI. Jawaban AI bersifat
                dinamis dan harus dicocokkan dengan bukti dalam skenario fiktif.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
