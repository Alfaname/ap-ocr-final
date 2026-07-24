# SECURITY.md
Kontrol keamanan (brief §AB) — status implementasi.

| # | Kontrol | Implementasi |
|---|---------|--------------|
| 1 | API key server-only | `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_*` hanya di route handler/server action. Tidak ada `NEXT_PUBLIC_` untuk rahasia. |
| 2 | Private storage bucket | Bucket `documents` private; unggah/unduh via server. |
| 3 | Signed URL TTL pendek | `createSignedUrl` (`SIGNED_URL_TTL_SECONDS`, default 300s) di halaman review. |
| 4 | Row-Level Security | Aktif seluruh tabel inti (`0001_init.sql`), policy per role via `has_role()`. |
| 5 | RBAC | `assertRole()` guard di setiap route handler + RLS. |
| 6 | Validasi MIME asli | Whitelist MIME di `/api/upload`; ukuran `UPLOAD_MAX_MB`. |
| 7 | Sanitasi nama file | `replace(/[^\w.\-]+/g,"_")` sebelum simpan path. |
| 8 | Anti-duplikat file | SHA-256 unik per batch (`documents.sha256`). |
| 9 | Masking rekening | `maskAccount()`; hanya ADMIN/APPROVER lihat penuh (`canSeeFullAccount`). |
| 10 | Cookie aman | Supabase SSR (httpOnly, secure di produksi). |
| 11 | Audit log | `audit_logs` append-only untuk UPLOAD/OCR/EDIT/APPROVE/EXPORT/SYNC/dsb. |
| 12 | Tidak log gambar/rekening | Pipeline tidak menulis gambar/rekening ke log aplikasi. |
| 13 | Tidak kirim master penuh ke browser | Query dibatasi `limit`; kolom sensitif dimasker server-side. |
| 14 | Tidak simpan token di localStorage | Sesi via cookie Supabase, bukan localStorage. |
| 15 | Invoice tak dapat diakses tanpa auth | `middleware.ts` memaksa login untuk semua rute kecuali `/`, `/login`. |
| 16 | Mode demo | Data `is_demo` tersamar; tidak menampilkan supplier/rekening asli. |

Catatan: rate limiting per-IP dan CSRF mengikuti default Next.js (Server Actions dilindungi origin check); untuk produksi tinggi tambahkan rate limiter (mis. Upstash) di middleware.
