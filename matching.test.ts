# DEPLOYMENT.md — dari repo kosong sampai online

## 1. Supabase
1. Buat project di supabase.com.
2. SQL Editor → jalankan `supabase/migrations/0001_init.sql`.
3. (Opsional demo) jalankan `supabase/seed.sql`.
4. Storage → buat bucket **private** bernama `documents`.
5. Authentication → aktifkan Email/Password. Buat user admin.
6. SQL: `insert into user_roles(user_id, role) values ('<UID_ADMIN>','ADMIN');`

## 2. Google Cloud (OAuth Drive/Sheets)
1. Buat project → OAuth consent screen (internal).
2. Credentials → OAuth client ID (Web). Authorized redirect URI:
   `https://<domain>/api/drive/callback` dan `.../api/sheets/callback`.
3. Aktifkan Drive API & Sheets API.
4. Simpan Client ID/Secret ke env.

## 3. Anthropic
1. Buat API key.
2. Set `ANTHROPIC_MODEL` ke model Claude yang mendukung vision/document.

## 4. Vercel
1. Push repo (tanpa `.env`).
2. Import project → Framework: Next.js.
3. Environment Variables: salin semua dari `.env.example` (server-only ditandai). `APP_BASE_URL` = domain produksi.
4. Deploy. Region `sin1` (Singapura) sudah diset di `vercel.json`.

## 5. Verifikasi
1. Buka domain → `/login` → masuk sebagai admin.
2. Impor master: `npm run import:master <supplier.xlsx> <sku.xlsx>` (atau via Integrasi).
3. Buat batch → unggah invoice → tunggu OCR → review → approve → export XLSX.
4. Hubungkan Google Sheets → Preview → Append (hanya batch APPROVED).
