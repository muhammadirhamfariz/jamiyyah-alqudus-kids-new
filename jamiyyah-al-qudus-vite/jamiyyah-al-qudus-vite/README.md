# Jamiyyah Al Qudus Kids

Aplikasi React + Vite + Firebase untuk sistem administrasi Jamiyyah Al Qudus Kids.

## Menjalankan lokal

1. Install Node.js LTS.
2. Jalankan `npm install`.
3. Salin `.env.example` menjadi `.env.local`.
4. Isi konfigurasi Firebase pada `.env.local`.
5. Jalankan `npm run dev`.

## Build

```bash
npm run build
```

## Vercel

Import repository GitHub ini sebagai project Vercel. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.

Tambahkan semua variabel `VITE_FIREBASE_*` dari `.env.local` ke Vercel Project Settings → Environment Variables.

Pastikan Anonymous Authentication diaktifkan di Firebase Authentication dan Firestore sudah dikonfigurasi sesuai kebutuhan aplikasi.
