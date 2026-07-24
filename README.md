# AP OCR — Pengajuan Account Payable

Aplikasi Next.js untuk mengubah foto/PDF invoice, nota, dan struk menjadi tabel pengajuan Account Payable dengan autentikasi Supabase, OCR, review manusia, approval, audit log, ekspor Excel, dan integrasi Google Drive/Sheets.

## Fitur yang tersedia

- Login Supabase dan proteksi route melalui middleware.
- Dashboard, batch, dokumen, review dua panel, pengajuan, ringkasan, master supplier/produk, integrasi, audit log, dan settings.
- Upload langsung dari browser ke bucket privat Supabase memakai signed upload URL.
- Batas file **30 MB** untuk PDF, JPG/JPEG, PNG, dan WebP.
- Deteksi file duplikat berdasarkan SHA-256.
- Pipeline klasifikasi dan OCR dengan Anthropic dari server.
- Validasi total, pencocokan supplier/produk, dan deteksi duplikat invoice.
- Review dan approval berbasis role.
- Ekspor Excel format pengajuan A–Q.
- Integrasi OAuth Google Drive dan Google Sheets.
- RLS, role guard, audit log, masking nomor rekening, dan rate limit dasar.

## Struktur penting

```text
app/                         Halaman dan API route Next.js
src/components/              Komponen UI
src/server/pipeline/         Pipeline pemrosesan dokumen
src/services/                OCR, export, Drive, dan Sheets
supabase/migrations/         Schema, RLS, function, dan action database
docs/                        Audit, arsitektur, keamanan, deployment, testing
tests/                       Unit test Vitest
e2e/                         Smoke test Playwright
```

## Environment variables

Salin `.env.example` menjadi `.env.local` untuk lokal atau masukkan variabel yang sama di Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=documents

ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

APP_BASE_URL=http://localhost:3000
UPLOAD_MAX_MB=30
SIGNED_URL_TTL_SECONDS=300
```

Jangan pernah mengisi atau mengunggah `.env.local` ke GitHub.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Deploy ke Vercel

1. Import repository GitHub `Alfaname/ap-ocr-final` ke Vercel.
2. Masukkan semua environment variables dari `.env.example`.
3. Set `APP_BASE_URL` ke domain deployment.
4. Deploy.
5. Tambahkan domain callback Google OAuth sesuai `GOOGLE_REDIRECT_URI`.
6. Di Supabase Auth, tambahkan domain Vercel ke Site URL/Redirect URLs.

## Supabase yang digunakan

- Project: `ap-ocr`
- Bucket: `documents`
- Bucket bersifat private.
- Maksimum upload: 30 MB.
- MIME: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`.

Database project sudah memiliki schema OCR, invoice, submission, master, role, review, approval, export, dan audit log. Jangan menjalankan migration lama secara membabi buta pada production tanpa membandingkan schema terlebih dahulu.

## Validasi paket

Paket distribusi dibuat tanpa `node_modules`, `.git`, `.env.local`, atau secret. Seluruh file `.ts` dan `.tsx` telah diperiksa sintaks TypeScript sebelum paket dibuat.
