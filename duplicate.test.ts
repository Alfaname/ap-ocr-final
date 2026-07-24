# SETUP GUIDES ringkas

## Anthropic API
1. console.anthropic.com → API Keys → Create.
2. `.env`: `ANTHROPIC_API_KEY=...`, `ANTHROPIC_MODEL=<model vision/document>`.
3. OCR dipanggil hanya dari server (`src/services/anthropic-ocr.ts`), retry+backoff otomatis.

## Google OAuth (umum)
1. Google Cloud Console → APIs & Services.
2. OAuth consent screen (internal) → Scopes minimum: `drive.readonly`, `spreadsheets`.
3. Credentials → OAuth Client (Web) → redirect URIs `/api/drive/callback`, `/api/sheets/callback`.

## Google Drive
- Tombol "Hubungkan Drive" di `/integrations` → OAuth → token disimpan di tabel `integrations`.
- `listFolder()` membaca hierarki folder (Bulan→Tanggal→Entitas→Supplier→File) sebagai HINT konteks. Nilai final tetap dari dokumen + review.

## Google Sheets
- "Hubungkan Sheets" → OAuth. Mode: PREVIEW ONLY / APPEND APPROVED ROWS / EXPORT XLSX ONLY.
- Append-only berbasis composite key kolom P: cek key yang sudah ada sebelum menambah → tidak dobel, tidak menimpa formula/baris lama. Hanya batch `APPROVED`.
