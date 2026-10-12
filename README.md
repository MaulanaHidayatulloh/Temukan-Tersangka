# TemukanTersangka

Game misteri interaktif berbasis React + Vite dengan backend Node.js yang menghubungkan fitur interogasi dan analisis bukti ke Google Gemini API.

## Persyaratan

- Node.js versi LTS terbaru (disarankan Node.js 22 atau lebih baru)
- API key dari Google AI Studio
- Koneksi internet saat memakai fitur AI

## Instalasi pertama kali

1. Ekstrak ZIP.
2. Buka folder proyek `Temukan Tersangka` di terminal.
3. Instal dependensi:

   ```bash
   npm install
   ```

4. Salin `.env.example` menjadi `.env`.
5. Buka `.env` dan isi `GEMINI_API_KEY` dengan API key milikmu. Jangan unggah file `.env` ke GitHub atau membagikannya kepada orang lain.

   ```env
   GEMINI_API_KEY=API_KEY_MILIKMU
   GEMINI_MODEL=gemini-3.8-flash
   API_PORT=3001
   ```

## Menjalankan aplikasi

Jalankan dua terminal dari folder proyek yang sama.

**Terminal 1 — backend AI:**

```bash
npm run server
```

**Terminal 2 — frontend:**

```bash
npm run dev
```

Buka URL yang ditampilkan Vite (biasanya `http://localhost:5173`).

## Memeriksa koneksi AI

Buka `http://localhost:3001/api/health`. Jika konfigurasi terbaca, hasilnya akan memiliki nilai `ok: true` dan `configured: true`.

Pemeriksaan health hanya mengecek server dan keberadaan API key, bukan menjamin bahwa Gemini menerima key atau kuota masih tersedia. Untuk menguji layanan sepenuhnya, coba fitur interogasi atau analisis bukti di aplikasi.

## Struktur kode

```text
src/
├── App.jsx
├── components/
│   ├── Beranda.jsx
│   ├── DetailKasus.jsx
│   ├── HasilAkhir.jsx
│   ├── Header.jsx
│   ├── IlustrasiKasus.jsx
│   ├── Logo.jsx
│   └── RuangInvestigasi.jsx
├── data/
│   └── caseData.js
├── index.css
└── main.jsx
server/
└── index.js
```

- `App.jsx`: perpindahan antarhalaman.
- `src/components/`: komponen UI dipisah berdasarkan tanggung jawabnya.
- `src/data/caseData.js`: data kasus, bukti, tersangka, dan helper penyimpanan.
- `server/index.js`: endpoint backend dan permintaan ke Gemini API.
- `vite.config.js`: meneruskan permintaan `/api` dari frontend ke backend lokal.

## Catatan keamanan

- API key hanya boleh berada di `.env` pada backend. Jangan gunakan awalan `VITE_` untuk API key.
- `.env` tidak disertakan di ZIP ini demi keamanan. Buat sendiri dari `.env.example`.
- Folder `.git` dan `node_modules` tidak diperlukan di ZIP distribusi.
