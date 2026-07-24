# TESTING.md
## Unit (Vitest) — `npm test`
- `tests/id-number.test.ts` — angka & tanggal Indonesia.
- `tests/composite-key.test.ts` — composite key kolom P (cocok byte-for-byte dgn sheet nyata).
- `tests/validation.test.ts` — total baris & invoice (termasuk kasus SUNPACK & PPN).
- `tests/matching.test.ts` — diskriminasi ukuran produk & variasi PT/CV supplier.
- `tests/duplicate.test.ts` — EXACT/POSSIBLE/NOT duplicate.

## E2E (Playwright) — `npm run e2e`
- `e2e/smoke.spec.ts` — landing tampil; rute terlindungi redirect ke `/login`.
  (Alur penuh upload→OCR→review→approve memerlukan Supabase & ANTHROPIC key aktif.)

## Validasi yang sudah dijalankan saat build
- 21 assertion logika inti lolos terhadap TypeScript sumber nyata (dikompilasi esbuild).
- Migration SQL parse bersih (72 statement, parser PostgreSQL).
- 50 file TS/TSX lolos syntax check esbuild.
- File XLSX hasil `excel-export.ts` dibuka openpyxl **tanpa repair**; seluruh format A–Q terverifikasi.

## Belum dijalankan di sandbox
- `npm run build` penuh & Playwright memerlukan instalasi dependensi berat + kredensial; jalankan di mesin/CI Anda.
