# AP OCR — Pengajuan Account Payable (Rhaya Group)

Ubah foto/PDF invoice, nota, struk menjadi tabel pengajuan Account Payable (format kolom **A–Q** persis seperti tab `PENGAJUAN JULI KNU`), dengan autentikasi, review manusia wajib, dan approval sebelum data final. Semua data supplier/rekening/invoice dilindungi login.

## Status build
**Fase 1 (Audit) — SELESAI & tervalidasi terhadap data nyata:**
- `docs/AUDIT_REFERENCE.md`, `docs/DATA_MAPPING.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/ARCHITECTURE.md` (ERD + alur Mermaid).

**Fondasi kode — SELESAI & tervalidasi (test pass):**
- `supabase/migrations/0001_init.sql` — 26 tabel, enum, trigger, **RLS per role**. Diverifikasi parse PostgreSQL (72 statement).
- `src/lib/id-number.ts` — normalisasi angka/tanggal Indonesia. **9/9 test pass**.
- `src/lib/composite-key.ts` — composite key kolom P. **Cocok byte-for-byte** dengan nilai nyata di sheet.
- `src/schemas/ocr.ts` — Zod structured output (brief §J). Transpile OK.
- `src/server/ocr-prompt.ts` — system prompt OCR (brief §K). Transpile OK.
- `.env.example` — seluruh kredensial server-only.

**Mesin/engine — SELESAI & tervalidasi (Fase 4–5 parsial):**
- `src/services/excel-export.ts` — ExcelJS export format A–Q. **Diverifikasi: file ter-generate dibuka openpyxl tanpa repair**; header `#D9EAD3`+Lexend bold, `=F×H`, `SUBTOTAL` sticky, dropdown POS/STATUS, autofilter, composite key, hyperlink dokumen, checkbox boolean. Contoh: `docs/CONTOH_EXPORT_PENGAJUAN.xlsx`.
- `src/lib/validation.ts` — validasi total baris & invoice + toleransi.
- `src/lib/supplier-match.ts`, `src/lib/product-match.ts`, `src/lib/text-normalize.ts` — fuzzy match (PT/CV/UD variasi; diskriminasi ukuran/kemasan `200 ML`≠`1 L`).
- `src/lib/duplicate.ts` — deteksi duplikat file/invoice/soft.
- `src/lib/mask.ts` — masking nomor rekening.
- `src/services/anthropic-ocr.ts` — OCR + klasifikasi (structured output Zod, retry+backoff, model dari `ANTHROPIC_MODEL`, server-only).
- `src/lib/supabase/{server,client}.ts`, `app/api/export/route.ts` (server, hanya batch APPROVED).
- `tests/*.test.ts` (Vitest) + `vitest.config.ts`, `package.json`, `tsconfig.json`, `next.config.mjs`.
- **12 assertion inti lolos** terhadap TypeScript sumber nyata (angka/tanggal id-ID, composite key byte-for-byte, validasi total, matching, masking).

**Belum dibuat (lanjutan Fase 4–7):** halaman React UI (login, dashboard, upload dropzone, review 2-panel, tabel pengajuan TanStack, ringkasan, master, audit-log, settings), orkestrasi pipeline route-handler (preprocess `sharp` → classify → ocr → validate → map → dedupe → review → approve), `services/sheets.ts` & `services/drive.ts` (OAuth), test integration + Playwright e2e, `vercel.json`. Lihat "Peta lanjutan".

## Prasyarat
Node 20+, akun Supabase, Anthropic API key (+ `ANTHROPIC_MODEL`), Google Cloud project (OAuth: Drive/Sheets), akun Vercel.

## Setup lokal
1. `cp .env.example .env.local` dan isi semua nilai (jangan commit).
2. `npm install`
3. **Supabase**: buat project → jalankan `supabase/migrations/0001_init.sql` (SQL editor atau `supabase db push`) → buat bucket **private** `documents`.
4. Buat user admin di Supabase Auth, lalu `insert into user_roles(user_id, role) values ('<uid>','ADMIN');`
5. Import master: `scripts/import-master` (SKU PRODUCT & DATA SUPPLIER 2 dari XLSX/CSV/Sheets) — preview & validasi sebelum commit.
6. `npm run dev` → http://localhost:3000

## Deploy ke Vercel
1. Push repo (tanpa `.env`). 2. Import project di Vercel. 3. Set semua env dari `.env.example` di Vercel (server-only ditandai). 4. Deploy. 5. Buka domain → login admin → buat batch → upload → uji OCR.

## Keamanan (ringkas — detail di IMPLEMENTATION_PLAN §11 / SECURITY.md)
Key & panggilan model hanya di server; bucket private + signed URL TTL pendek; RLS + guard per role; masking `no_rekening`; tidak ada token sensitif di localStorage; invoice tidak dapat diakses tanpa auth; mode demo hanya data tersamar.

## Aturan bisnis yang di-hardcode dari audit (jangan diubah tanpa alasan)
- TOTAL (I) = QTY (F) × HARGA SATUAN (H); total OCR asli tetap disimpan untuk rekonsiliasi.
- Total sticky = `SUBTOTAL(9, I:I)` mengikuti filter.
- SKU (D) = lookup `SKU PRODUCT!G` via RINCIAN→`H`; jangan dipaksakan jika tak cocok.
- SATUAN (G) = `SKU PRODUCT!I (UOM)`.
- STATUS default `PENDING`; jangan auto-DONE setelah OCR.
- Nomor invoice & no rekening = string (jaga nol depan).
- Header: Lexend 10 bold, fill `#D9EAD3`, freeze row 2 + col A.
- Entitas = master (GNU, KNU, GDN, SGP, TSK), bukan hanya GNU/KNU.

## Peta lanjutan (file berikutnya)
`app/(auth)/login`, `app/dashboard`, `app/batches/*`, `app/batches/[id]/review`, `app/pengajuan`, `app/ringkasan`, `app/master/*`, `app/integrations`, `app/audit-log`, `app/settings` · `server/pipeline/*` (preprocess `sharp`, classify, ocr `@anthropic-ai/sdk`, validate, match, dedupe) · `services/excel-export.ts`, `services/sheets.ts`, `services/drive.ts` · `tests/*`, `e2e/*`, `vercel.json`.
