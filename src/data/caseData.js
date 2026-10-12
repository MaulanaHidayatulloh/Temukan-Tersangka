export const KUNCI_PROGRES = "temukantersangka-progres-MM-001";
export const KUNCI_REKOR = "temukantersangka-rekor-MM-001";

export function bacaRekorTerbaik() {
  try {
    return Number(window.localStorage.getItem(KUNCI_REKOR)) || 0;
  } catch {
    return 0;
  }
}

export function tentukanPeringkat(skor) {
  if (skor >= 1100)
    return {
      nama: "Detektif Elite",
      ambang: 1100,
      berikutnya: null,
      deskripsi: "Ketelitian dan deduksi tingkat tertinggi.",
    };
  if (skor >= 800)
    return {
      nama: "Detektif Senior",
      ambang: 800,
      berikutnya: 1100,
      deskripsi: "Mampu menyusun teori dari beberapa petunjuk.",
    };
  if (skor >= 500)
    return {
      nama: "Analis Bukti",
      ambang: 500,
      berikutnya: 800,
      deskripsi: "Mulai melihat hubungan antarpetunjuk.",
    };
  if (skor >= 200)
    return {
      nama: "Pengamat",
      ambang: 200,
      berikutnya: 500,
      deskripsi: "Terus gali informasi sebelum menyimpulkan.",
    };
  return {
    nama: "Kandidat Detektif",
    ambang: 0,
    berikutnya: 200,
    deskripsi: "Mulai kumpulkan bukti untuk membangun kasus.",
  };
}

export function bacaProgresTersimpan() {
  try {
    const data = window.localStorage.getItem(KUNCI_PROGRES);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export const kasus = {
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
      foto: "https://randomuser.me/api/portraits/women/44.jpg",
      deskripsi:
        "Mengaku berada di sayap timur kediaman saat kejadian. Hubungannya dengan korban belakangan dikabarkan memburuk.",
      warna: "merah",
    },
    {
      nama: "Edward Hayes",
      peran: "Mitra bisnis",
      inisial: "EH",
      foto: "https://randomuser.me/api/portraits/men/32.jpg",
      deskripsi:
        "Bersikeras telah meninggalkan kediaman sebelum tengah malam. Ia memiliki kepentingan bisnis bersama korban.",
      warna: "emas",
    },
    {
      nama: "Arthur Wells",
      peran: "Kepala pelayan",
      inisial: "AW",
      foto: "https://randomuser.me/api/portraits/men/75.jpg",
      deskripsi:
        "Orang terakhir yang mengaku menyajikan minuman untuk korban. Ia telah bekerja di kediaman itu selama bertahun-tahun.",
      warna: "abu",
    },
  ],
};

export const barangBukti = [
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

export const wawancaraTersangka = [
  {
    nama: "Victoria Blackwood",
    peran: "Istri korban",
    inisial: "VB",
    foto: "https://randomuser.me/api/portraits/women/44.jpg",
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
    foto: "https://randomuser.me/api/portraits/men/32.jpg",
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
    foto: "https://randomuser.me/api/portraits/men/75.jpg",
    warna: "abu",
    alibi: "Mengaku selesai melayani minuman lalu kembali ke ruang servis.",
    pernyataan:
      '"Saya hanya menjalankan tugas seperti biasa. Tuan Blackwood meminta teh, jadi saya mengantarkannya. Saya tidak melihat sesuatu yang aneh."',
    catatan:
      "Jadwal pelayanan menempatkan Arthur sebagai orang yang terakhir membawa minuman ke korban. Keterangannya perlu dicocokkan dengan bukti fisik.",
  },
];

export const pertanyaanInterogasi = [
  [
    {
      id: "waktu",
      pertanyaan: "Di mana Anda berada pada pukul 23.12?",
      jawaban:
        "Saya berada di sayap timur. Saya tidak mendekati ruang kerja setelah pertengkaran kami.",
      catatan:
        "Pernyataan ini belum didukung saksi yang mengonfirmasi keberadaan Victoria di sayap timur.",
    },
    {
      id: "pertengkaran",
      pertanyaan: "Apa yang memicu pertengkaran dengan korban?",
      jawaban:
        "Ia menuduh saya mengetahui sesuatu tentang urusan keuangannya. Saya tidak tahu halaman mana yang ia maksud.",
      catatan:
        "Victoria mengetahui adanya persoalan keuangan, tetapi jawaban ini belum membuktikan keterlibatannya.",
    },
  ],
  [
    {
      id: "pergi",
      pertanyaan:
        "Apakah Anda benar-benar meninggalkan kediaman sebelum pukul 23.00?",
      jawaban:
        "Saya keluar dari ruang tamu sebelum pukul sebelas. Saya tidak mengatakan bahwa saya langsung meninggalkan seluruh kediaman.",
      catatan:
        "Jawaban Edward memperjelas pernyataannya, tetapi waktu keberangkatannya masih perlu diverifikasi.",
    },
    {
      id: "keuangan",
      pertanyaan: "Apa hubungan Anda dengan catatan keuangan korban?",
      jawaban:
        "Kami memiliki urusan bisnis bersama. Saya meminta penjelasan tentang beberapa transaksi, tetapi tidak mengambil dokumennya.",
      catatan:
        "Hubungan bisnis memberi kemungkinan motif, tetapi halaman yang hilang belum mengidentifikasi siapa yang mengambilnya.",
    },
  ],
  [
    {
      id: "teh",
      pertanyaan: "Siapa yang menyiapkan teh untuk korban malam itu?",
      jawaban:
        "Saya menyiapkan nampannya. Teh itu dibuat seperti biasa dan saya mengantarkannya sekitar pukul 23.12.",
      catatan:
        "Jawaban Arthur cocok dengan jadwal pelayanan dan menempatkannya dekat minuman pada waktu kritis.",
    },
    {
      id: "kunci",
      pertanyaan: "Mengapa kunci cadangan tidak berada di tempatnya?",
      jawaban:
        "Saya tidak tahu. Lemari itu digunakan staf servis, dan saya tidak memeriksa isinya setelah makan malam.",
      catatan:
        "Arthur memiliki akses ke ruang servis, tetapi keterangan ini belum membuktikan bahwa ia mengambil kunci.",
    },
  ],
];

export const hubunganBukti = {
  "B-01|B-02": {
    judul: "Kesempatan dan sarana saling menguatkan",
    status: "hubungan-kuat",
    label: "HUBUNGAN KUAT",
    isi: "Cangkir menunjukkan minuman korban perlu diperiksa, sementara jadwal menempatkan Arthur sebagai pengantar teh pada pukul 23.12. Keduanya menghubungkan minuman dengan orang yang memiliki kesempatan menyentuhnya, tetapi belum membuktikan siapa yang mencampur minuman.",
  },
  "B-02|B-04": {
    judul: "Akses ruang servis perlu ditelusuri",
    status: "hubungan-sedang",
    label: "PETUNJUK PENDUKUNG",
    isi: "Jadwal pelayanan menempatkan Arthur di jalur menuju ruang kerja, sedangkan kunci cadangan ditemukan tidak pada tempatnya. Hubungan ini membuka kemungkinan akses yang tidak tercatat, tetapi staf lain juga dapat menggunakan ruang servis.",
  },
  "B-03|B-04": {
    judul: "Motif dan akses belum terhubung langsung",
    status: "butuh-bukti",
    label: "BUTUH PEMERIKSAAN LANJUT",
    isi: "Halaman buku besar yang hilang mengisyaratkan persoalan keuangan, sementara kunci cadangan membuka pertanyaan tentang akses. Belum ada bukti yang menghubungkan rahasia keuangan dengan orang yang mengambil kunci.",
  },
  "B-01|B-04": {
    judul: "Minuman dan akses ruang kerja",
    status: "hubungan-sedang",
    label: "PETUNJUK PENDUKUNG",
    isi: "Minuman korban dan kunci cadangan sama-sama berkaitan dengan akses ke ruang kerja. Namun, keduanya belum membuktikan bahwa kunci digunakan untuk memasuki ruangan atau bahwa minuman telah dicampur di luar ruang kerja.",
  },
  "B-01|B-03": {
    judul: "Dua petunjuk dengan konteks berbeda",
    status: "butuh-bukti",
    label: "BELUM TERHUBUNG",
    isi: "Cangkir mengarah pada cara kejadian berlangsung, sedangkan halaman buku besar mengarah pada kemungkinan motif keuangan. Belum ada bukti langsung yang menghubungkan kedua hal ini.",
  },
  "B-02|B-03": {
    judul: "Kesempatan belum menjelaskan motif",
    status: "butuh-bukti",
    label: "BUTUH PEMERIKSAAN LANJUT",
    isi: "Jadwal pelayanan membantu menyusun garis waktu, sementara halaman buku besar menunjukkan adanya persoalan keuangan. Informasi yang tersedia belum menunjukkan bahwa orang yang mengantar teh juga terkait dengan dokumen yang hilang.",
  },
};
