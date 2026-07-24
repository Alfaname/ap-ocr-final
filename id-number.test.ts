# ARCHITECTURE.md

## Alur OCR & Approval
```mermaid
flowchart TD
  A[Upload file JPG/PNG/WEBP/HEIC/PDF/ZIP] --> B{sha256 dup?}
  B -- ya --> BX[Tandai EXACT_DUPLICATE, stop]
  B -- tidak --> C[Preprocess: EXIF rotate, deskew, crop, contrast, sharpen, denoise + quality flags]
  C --> D[Klasifikasi dokumen]
  D -->|UNKNOWN| DX[Tandai, jangan paksa jadi invoice]
  D -->|INVOICE/RECEIPT/...| E[Claude OCR structured output - Zod]
  E --> F[Validasi total baris & invoice + toleransi]
  F --> G[Map supplier -> DATA SUPPLIER 2]
  G --> H[Map produk -> SKU PRODUCT]
  H --> I[Duplicate check: file/invoice/soft]
  I --> J[REVIEW manusia 2 panel - field merah wajib]
  J -->|revisi| J
  J --> K[APPROVE per invoice]
  K --> L[submission_rows final A-Q]
  L --> M[Export XLSX / Preview -> Append Google Sheets]
```

## ERD (inti)
```mermaid
erDiagram
  profiles ||--o{ user_roles : has
  roles ||--o{ user_roles : grants
  batches ||--o{ documents : contains
  documents ||--o{ document_pages : has
  documents ||--o{ document_processing_jobs : runs
  documents ||--o{ ocr_runs : produces
  ocr_runs ||--|| ocr_raw_responses : stores
  ocr_runs ||--o{ invoices : yields
  invoices ||--o{ invoice_items : has
  invoices ||--o{ invoice_adjustments : has
  invoices ||--o{ validation_results : validated_by
  invoices ||--o{ duplicate_matches : flagged
  suppliers ||--o{ supplier_aliases : alias
  products ||--o{ product_aliases : alias
  invoices }o--|| suppliers : mapped_to
  invoice_items }o--|| products : mapped_to
  invoices ||--o{ submission_rows : becomes
  batches ||--o{ submission_summaries : summarized
  batches ||--o{ exports : exported
  profiles ||--o{ audit_logs : acts
```

## Struktur repository
```
/app            Next.js App Router (rute §E)
/components     UI (shadcn/ui) + tabel/review/upload
/lib            id-number, composite-key, supabase client, utils
/server         route handlers, actions, pipeline, ocr, guards
/services       excel-export, sheets, drive, anthropic
/schemas        Zod (ocr, forms, api)
/types          TypeScript types
/supabase       config + migrations + seed
/tests          Vitest (unit + integration)
/e2e            Playwright
/public         aset statis
/scripts        import master, seed demo (tersamar)
/docs           dokumen ini + audit + setup guides
```
Entitas dimodelkan sebagai **master `entities`** (GNU, KNU, GDN, SGP, TSK) — bukan enum keras — karena data nyata memakai lebih dari GNU/KNU (AUDIT §5).
