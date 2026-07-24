# IMPLEMENTATION_PLAN.md
Aplikasi web **AP OCR — Pengajuan Account Payable** (Rhaya Group). Mengubah foto/PDF invoice, nota, struk menjadi tabel pengajuan AP (format `A–Q` sesuai `AUDIT_REFERENCE.md`), dengan autentikasi, review manusia, dan approval sebelum data final.

## 1. Arsitektur (ringkas)
```mermaid
flowchart LR
  U[User/Browser] -->|HTTPS+Auth| N[Next.js App Router\nServer Actions + Route Handlers]
  N -->|RLS| DB[(Supabase Postgres)]
  N -->|signed URL| ST[Supabase Storage\nprivate bucket]
  N -->|server-only key| AI[Anthropic API\nClaude vision/document]
  N --> GS[Google Sheets API]
  N --> GD[Google Drive API]
  N --> XL[ExcelJS export]
  subgraph Pipeline (server)
    P1[upload]-->P2[preprocess]-->P3[classify]-->P4[OCR]-->P5[validate]-->P6[map]-->P7[review]-->P8[approve]-->P9[final rows]
  end
```
Prinsip: **semua kredensial & panggilan model di server** (Route Handlers / Server Actions). Browser hanya menerima signed URL berumur pendek. Tidak ada service-role key / API key di frontend.

## 2. Stack (versi stabil terbaru saat build)
Next.js (App Router) + TypeScript + Tailwind + shadcn/ui · Supabase (Postgres + Auth + Storage) · Anthropic SDK (`ANTHROPIC_MODEL` via env) · Zod · React Hook Form · TanStack Table · ExcelJS · Vitest + Playwright · Deploy Vercel. **Menerima rekomendasi brief; tidak ada penggantian arsitektur.** Tambahan yang dibenarkan: `sharp` (preprocessing gambar server-side), `pdf-lib`/`pdfjs` (split PDF), `unzipper` (ZIP), `string-similarity`/token Jaccard (fuzzy match) — semua server-side, alasan: fungsi wajib brief (§H, §G, §L) tidak tersedia native.

## 3. Komponen Frontend (rute — sesuai §E brief)
`/` info+login · `/login` · `/dashboard` · `/batches` · `/batches/new` · `/batches/[id]` · `/batches/[id]/review` (2 panel) · `/pengajuan` (TanStack, format A–Q) · `/ringkasan` · `/documents` · `/master/suppliers` · `/master/products` · `/integrations` · `/audit-log` · `/settings`. Komponen inti: `UploadDropzone`, `DocumentViewer` (zoom/rotate/crop/bbox highlight), `ReviewPanel`, `LineItemsTable`, `SupplierMatchCombobox`, `ProductMatchCombobox`, `ValidationBadge`, `ConfidencePill`, `PengajuanTable` (sticky SUBTOTAL, virtual scroll, inline edit), `SummaryTable`, `ExportDialog`, `SheetsSyncPreview`.

## 4. Backend
Route Handlers: `/api/upload`, `/api/documents/[id]/preprocess`, `/api/ocr/run`, `/api/ocr/[id]/result`, `/api/validate`, `/api/match/supplier`, `/api/match/product`, `/api/duplicates/check`, `/api/review/*`, `/api/approve`, `/api/export/xlsx`, `/api/sheets/preview`, `/api/sheets/append`, `/api/drive/*`. Semua idempotent bila relevan, dengan retry + exponential backoff untuk API eksternal, dan job state (`document_processing_jobs`).

## 5. Database & Storage (lihat migrations)
Postgres via Supabase, PK `uuid`, `created_at/updated_at/created_by/updated_by`, soft delete, FK, index, **RLS per role**, constraint. Nilai finansial `numeric(15,2)` (bukan float). Nomor invoice & rekening `text`. Storage: bucket **private** `documents/`, akses hanya via signed URL server. Tabel sesuai §V brief (26 tabel) — lihat `supabase/migrations`.

## 6. OCR Pipeline (server)
`upload → sha256 (anti-dup) → preprocess (EXIF rotate, deskew, crop, contrast, sharpen, denoise, quality flags) → classify (INVOICE/RECEIPT/...) → Claude structured output (JSON tervalidasi Zod, schema §J) → validate (line & invoice totals, toleransi) → map supplier/produk → duplicate check (file/invoice/soft) → review manusia → approve → submission_rows final`. Prompt sistem OCR persis prinsip §K (jangan menebak; null+warning; angka id-ID; jaga nol depan; jangan campur subtotal/pajak/total). Model dari `ANTHROPIC_MODEL`.

## 7. Autentikasi & RBAC
Supabase Auth (cookie httpOnly, secure). Role: `ADMIN, UPLOADER, REVIEWER, APPROVER, VIEWER` (tabel `roles`/`user_roles`). Hak akses diberlakukan di **RLS + server action guard** (bukan hanya UI). Mode demo publik = dataset tersamar (supplier/rekening palsu), read-only, terisolasi via flag `is_demo`.

## 8. Review, Validasi, Approval
Halaman review 2 panel (dokumen ↔ data), indikator confidence (hijau ≥0.90 / kuning 0.70–0.89 / merah <0.70 / abu tak terbaca). **Field merah wajib direview sebelum approve.** Nilai OCR asli disimpan permanen walau dikoreksi. Approval mengunci baris → masuk `submission_rows` final.

## 9. Export Excel (ExcelJS)
Workbook: `PENGAJUAN GNU`, `PENGAJUAN KNU` (+entitas lain), `RINGKASAN`, `MASTER MAPPING`, `VALIDATION ISSUES`, `AUDIT LOG`. Sheet pengajuan: kolom A–Q persis, font Lexend (fallback sans), header `#D9EAD3`, border, freeze row 2 & col A, autofilter, format tanggal/QTY/harga, formula `=F×H` & `=SUBTOTAL(9,I:I)`, dropdown POS/STATUS, composite key, checkbox, hyperlink dokumen. Nama file `PENGAJUAN_AP_<TGL_BATCH>.xlsx`. Bebas warning repair.

## 10. Integrasi Google Sheets / Drive
Sheets: 3 mode `PREVIEW ONLY | APPEND APPROVED ROWS | EXPORT XLSX ONLY`; **append-only**, cek duplikat sebelum append, tidak menimpa baris/formula lama, hanya setelah batch `APPROVED`. Drive: OAuth scope minimum, pilih folder/file, simpan fileId + webViewLink; folder = **hint** konteks saja. Simpan metadata sync (spreadsheetId, sheetId, range, waktu, jumlah baris, status, error, user).

## 11. Keamanan (§AB brief)
Key hanya server; bucket private + signed URL; RLS; validasi MIME asli + ukuran; sanitasi nama file; rate limiting; CSRF sesuai framework; secure cookie; audit log; **masking rekening**; tidak log gambar/rekening; tidak kirim seluruh master ke browser; tidak simpan token sensitif di localStorage; invoice tidak dapat diakses tanpa auth. Detail di `SECURITY.md`.

## 12. Testing (§AD)
Unit (Vitest): normalisasi angka/tanggal id-ID, line/grand total, supplier/product match, composite key, duplicate detection, role permission, XLSX export. Integration: upload→OCR→review→approve, PDF multi-halaman, multi-item, batch GNU+KNU, unmapped supplier/produk, mismatch total, dup file/invoice, sync Sheets, export. E2E (Playwright): alur utama. Fixture = beberapa dokumen lampiran setelah data sensitif disamarkan.

## 13. Deployment
`README.md` + `DEPLOYMENT.md`: dari repo kosong → Supabase project + migrations + RLS + bucket → env di Vercel → deploy → domain → login admin → uji upload+OCR. `.env.example` lengkap, tanpa kredensial di repo.

## 14. Ruang lingkup pengerjaan bertahap
Fase 1 (audit) — **selesai**: 3 dokumen ini. Fase 2 arsitektur (Mermaid + ERD). Fase 3 DB/backend (migrations, RLS, schema, pipeline). Fase 4 frontend. Fase 5 integrasi. Fase 6 testing. Fase 7 deployment. Repo dibangun mengikuti struktur `/app /components /lib /server /types /schemas /services /supabase /migrations /tests /e2e /public /scripts /docs`.
