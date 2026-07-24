# AUDIT_REFERENCE.md
**Sumber kebenaran:** Google Spreadsheet `DATA ACCOUNT PAYABLE JULI 2026`
(ID `1o5V3N9Tsc_HdtYVleuEKmtVhtwKJrSFHOidIe2L7rCI`) + folder Drive `2) INVOICE PENGAJUAN`
(ID `10P5eZZ_CFezP3RT7PZF3LVeApmx-eXS4`)
**Tanggal audit:** 24 Juli 2026 · **Timezone acuan:** Asia/Jakarta · **Locale:** id-ID

> Semua nilai di bawah dibaca langsung dari file (export XLSX 4,74 MB, 21 tab). Tidak ada kolom, formula, atau mapping yang dikarang. Bagian yang tidak dapat diverifikasi ditandai eksplisit sebagai **BELUM TERVERIFIKASI**.

---

## 1. Daftar File yang Diterima

| # | Objek | ID | Tipe | Status akses |
|---|-------|----|------|--------------|
| 1 | `DATA ACCOUNT PAYABLE JULI 2026` | `1o5V3N9…7rCI` | Google Spreadsheet | ✅ Terbaca penuh (21 tab) |
| 2 | Folder `2) INVOICE PENGAJUAN` | `10P5eZZ…eXS4` | Google Drive folder | ⚠️ Metadata terbaca; **isi folder tidak dapat dienumerasi** oleh konektor (query `parents` ditolak, `parentId` mengembalikan kosong). Folder ini adalah repositori dokumen invoice sumber. |

**Catatan blocker nyata (satu-satunya):** Konektor Google Drive pada sesi ini tidak mengembalikan daftar anak folder `2) INVOICE PENGAJUAN`. Struktur folder (Bulan → Tanggal → Entitas → Supplier → File) dipakai sebagai **hint konteks** di aplikasi, tetapi tidak menjadi sumber kebenaran — sesuai aturan Anda, nilai final tetap dari dokumen + review manusia.

---

## 2. Daftar Tab (Sheet) dan Fungsinya

| Tab | Dimensi | Visibilitas | Fungsi |
|-----|---------|-------------|--------|
| **SKU PRODUCT** | A1:AN1170 (40 kol) | visible | **Master produk/SKU** (871 SKU aktif). Di-generate via custom function (`__xludf.DUMMYFUNCTION`, mis. IMPORTRANGE/QUERY) dari sumber eksternal. |
| **DATA SUPPLIER 2** | A1:N1000 | visible | **Master supplier** (±49 supplier terisi) + term of payment, bank, rekening, kriteria. |
| **SUMMARY** | A1:E7 | visible | Ringkasan agregat per entitas (GNU/KNU/GDN/BGN SGP/BGN TSK): Tagihan Donat + Daily Purchasing + Invoice = Total. |
| **PENGAJUAN JULI KNU** | A1:Q1988 (17 kol) | visible | **Tab pengajuan AP — format acuan utama** (17 kolom A–Q). |
| **PENGAJUAN JULI GNU** | A1:Z1988 | visible | Tab pengajuan GNU (kolom inti A–Q identik; P–Z kosong/teknis). |
| **PENGAJUAN JULI TASIK** | A1:Q2700 | visible | Tab pengajuan Tasik/GDN (17 kol A–Q). |
| **REPORT UPDATE PENGAJUAN** | A1:Q19591 | visible | Log/kompilasi historis seluruh baris pengajuan (17 kol). |
| **21/17/14/10/7/3/31 JULI** | bervariasi | visible | Snapshot/kertas kerja harian per tanggal pengajuan. |
| **TAGIHAN DONAT GARUT** | A1:M2847 | visible | Sumber tagihan lini "Donat" Garut (di-SUMIF ke SUMMARY). |
| **TAGIHAN DONAT TASIK** | A1:L1095 | visible | Sumber tagihan Donat Tasik. |
| **DAILY PURCHAS GARUT** | A1:EE5017 (135 kol) | visible | Buku pembelian harian Garut (lebar; multi-kolom kota). |
| **DAILY PURCHAS TASIK** | A1:AU1501 | visible | Buku pembelian harian Tasik. |
| **Copy of PENGAJUAN JULI KNU** | A1:P2022 | **hidden** | Salinan/arsip KNU. |
| **Copy of PENGAJUAN JULI GNU** | A1:P1998 | **hidden** | Salinan/arsip GNU. |

**Total: 21 tab (19 visible, 2 hidden).**

---

## 3. Struktur Tab Pengajuan — FORMAT ACUAN (17 kolom, A–Q)

Header ada di **baris 2**; baris 1 menampung **total sticky** di atas kolom TOTAL. Data mulai **baris 3**.

| Kol | Header (persis) | Isi contoh nyata | Tipe | Formula / Perilaku |
|-----|-----------------|------------------|------|--------------------|
| A | `TGL INVOICE` | `2026-07-02` | date | Format tampilan `d" "mmm" "yyyy` → "2 Jul 2026" |
| B | `OUTLET` | `KNU`,`GNU`,`GDN`,`TDG SGP` | text | Entitas/outlet |
| C | `SUPPLIER/ VENDOR` | `HD JAYA SYRUP`,`SUNPACK`,`NEWSAE` | text | Nama supplier (mentah, sesuai isian) |
| D | `SKU` | `4007250010` | text | **Formula:** `=IFERROR(INDEX('SKU PRODUCT'!G:G,MATCH(E3,'SKU PRODUCT'!H:H,0)),"")` |
| E | `RINCIAN` | `SYRUP DENALI STRAWBERRY 2 L` | text | Divalidasi dropdown ke `'SKU PRODUCT'!H:H` (NAME) |
| F | `QTY` | `1`, `1000`, `100` | decimal | Angka desimal (mis. `1,00`) |
| G | `SATUAN` | `PCS`,`PACK`,`KG` | text | **Formula:** `=IFERROR(INDEX('SKU PRODUCT'!$Q...,MATCH($E3,'SKU PRODUCT'!$H...,0)),"")` (lookup UOM dari master) |
| H | `HARGA SATUAN` | `204795` | numeric | Format `#,##0` |
| I | `TOTAL` | `=F3*H3` | numeric | **Formula `=F*H`** (QTY×HARGA). Format `#,##0` |
| J | `POS` | `BAHAN BAKU` | text | **Dropdown** (lihat §5) |
| K | `KETERANGAN` | (kosong) | text | Bebas |
| L | `JATUH TEMPO` | `2026-07-03` | date | Bisa dihitung TGL INVOICE + TOP |
| M | `TGL PENGAJUAN` | `2026-07-03` | date | Format `d" "mmmm" "yyyy` → "3 Juli 2026" |
| N | `INVOICE` | (nomor invoice, string) | text | Nomor invoice, pertahankan nol depan |
| O | `STATUS PENGAJUAN` | `DONE`,`PENDING` | text | **Dropdown** (lihat §5) |
| P | *(technical composite key)* | `2 Jul 2026♦️KNU♦️HD JAYA SYRUP♦️…` | text | Formula composite key (lihat §6) |
| Q | *(checkbox)* | `False` | boolean | Checkbox operasional, default `False` |

**Total sticky baris 1 (kolom I):** `=SUBTOTAL(9,I3:I7975)` — mengikuti filter aktif (sesuai spesifikasi Anda).

---

## 4. Master Data

### 4.1 SKU PRODUCT (871 SKU aktif)
Struktur header (baris 3), kolom nyata:

| Kol | Field | Contoh |
|-----|-------|--------|
| A | DEPARTMENT CODE | `40` |
| B | DEPARTMENT NAME | `RAW MATERIAL` |
| C | CATEGORY CODE | `01` |
| D | CATEGORY NAME | `RED MEAT` |
| E | SUB CATEGORY CODE | `03` |
| F | SUB CATEGORY NAME | `BEEF` |
| **G** | **SKU** | `4001030001` (10 digit) |
| **H** | **NAME** | `BABAT SAPI KG` ← kunci match RINCIAN |
| **I** | **UOM** | `KG` ← sumber SATUAN |
| J | UOM MINIMUM | `GR` |
| K | GRAMASI | `1000` |
| L/N/P/R | PRICE (BANDUNG/TASIK/GARUT/SURABAYA) | harga referensi per kota |

> **Catatan penting:** SKU PRODUCT diisi lewat `__xludf.DUMMYFUNCTION` (custom/IMPORTRANGE). Berarti master ini **tersinkron dari sumber eksternal** — aplikasi harus mengimpor snapshot, bukan mengasumsikan editable langsung.

### 4.2 DATA SUPPLIER 2 (±49 supplier)
Kolom: `NO | NAMA SUPPLIER | TERM OF PAYMENT | STATUS KONTRAK | PRODUK | NAMA PIC | DOMISILI | ALAMAT LENGKAP | NOMOR TELF | PAYMENT METHOD | NAMA BANK | PEMILIK REKENING | NO REKENING | KRITERIA`

Contoh: `ADAM NR SAYUR | TOP 3 | … | TRANSFER | BRI | TATA SUKMANA | 444301000301503 | (kriteria)` ; `ADIJAYA | TOP 7 | TRANSFER | BCA | UTAMI HERIKSA LATIF | 1390021913 | PERORANGAN`.

> **`NO REKENING` = data sensitif.** Wajib masking untuk role non-berwenang (§ SECURITY).

---

## 5. Dropdown / Data Validation (dibaca dari file)

| Kolom | Tipe | Nilai |
|-------|------|-------|
| J `POS` | list | `BAHAN BAKU, SERVICE, GAS, BARANG JADI, KEMASAN, BENSIN, ONGKIR, LAINNYA, EDR` |
| O `STATUS PENGAJUAN` | list | `DONE, PENDING` |
| E `RINCIAN` | list (range) | `'SKU PRODUCT'!H:H` |

**Nilai POS yang benar-benar terpakai** (frekuensi nyata): BAHAN BAKU (1035), EDR (70), BARANG JADI (32), KEMASAN (27), ONGKIR (21), GAS (17), LAINNYA (8). SERVICE & BENSIN terdaftar di dropdown tapi belum terpakai di Juli.

**Nilai OUTLET yang benar-benar terpakai:** `KNU` (1328), `GNU` (1208), `GDN` (1200), `TDG SGP` (13). SUMMARY juga menyebut entitas `BGN SGP` dan `BGN TSK`.

> **Inkonsistensi entitas — keputusan desain:** Spesifikasi menyebut GNU/KNU sebagai nilai utama OUTLET, tetapi data nyata memakai **GNU, KNU, GDN, TDG SGP/TSK**, dan SUMMARY memakai **GNU, KNU, GDN, BGN SGP, BGN TSK**. Aplikasi memodelkan `entities` sebagai tabel master (bukan enum keras) agar GDN/SGP/TSK tidak hilang. GNU & KNU tetap default UI.

---

## 6. Composite Key (kolom P) — persis dari file
```
=IF(OR($C3="",$E3=""),"",
   TEXTJOIN("♦️",FALSE,
     ARRAYFORMULA(IF($A3:$O3="","∅",TRIM(TO_TEXT($A3:$O3))))))
```
Aturan: kosong bila C (supplier) atau E (rincian) kosong; sel kosong → `∅`; delimiter `♦️`; setiap nilai di-`TRIM`; membentang A→O. Contoh hasil nyata: `2 Jul 2026♦️KNU♦️HD JAYA SYRUP♦️4007250010♦️SYRUP DENALI STRAWBERRY 2 L♦️1,00♦️∅♦️204.795♦️204.795♦️∅♦️∅♦️∅♦️3 Juli 2026♦️∅♦️DONE`. **Bukan primary key DB** — hanya kunci turunan/tampilan (sesuai instruksi).

---

## 7. Formula Kunci Lain
- **TOTAL:** `=F*H` (QTY × HARGA SATUAN).
- **Total sticky:** `=SUBTOTAL(9, I3:I…)` (mengikuti filter).
- **SKU (D):** `INDEX('SKU PRODUCT'!G:G, MATCH(E, H:H,0))`.
- **SATUAN (G):** `INDEX(SKU PRODUCT UOM, MATCH(E, H:H,0))`.
- **SUMMARY:** `Total = Tagihan Donat + Daily Purchasing + Invoice`, per entitas via `SUMIF(...!B:B, "<ENTITAS>", ...)`; baris 7 = grand total kolom.

---

## 8. Format Visual (dibaca dari file)
- **Font:** `Lexend`, ukuran `10`, header **bold**.
- **Warna header:** `#D9EAD3` (ARGB `FFD9EAD3`).
- **Frozen panes:** bervariasi antar tab (KNU=`D3`, GNU=`B3`, TASIK=`A3`). Standar aplikasi disatukan ke **freeze baris 2 + kolom A**.
- **Number format:** HARGA & TOTAL `#,##0`; TGL INVOICE `d mmm yyyy`; TGL PENGAJUAN `d mmmm yyyy`.
- **Alignment:** QTY center; harga/total right; supplier/rincian left; tanggal center.
- **Nominal tanpa simbol Rp** di tabel utama.

---

## 9. Masalah Kualitas Data & Risiko (temuan nyata)
1. **Duplikasi tab:** ada `Copy of PENGAJUAN JULI KNU/GNU` (hidden) — risiko baca ganda. Aplikasi harus memakai tab non-copy sebagai acuan.
2. **Entitas tidak konsisten** antara dropdown, data terpakai, dan SUMMARY (§5). Dimodelkan sebagai master entitas.
3. **SKU & SATUAN adalah formula lookup** — bila RINCIAN tidak persis sama dengan `SKU PRODUCT!H`, hasilnya kosong (unmapped). Banyak baris TASIK berkolom D (SKU) kosong → produk belum terpetakan.
4. **`NO REKENING` tersimpan sebagai number** (mis. `444301000301503.0`) → risiko kehilangan digit/nol depan. Di DB harus **string**.
5. **INVOICE (kolom N) sering kosong** di data historis — nomor invoice belum terisi konsisten.
6. **Master SKU via IMPORTRANGE/xludf** → nilai bergantung sumber eksternal; perlu snapshot terkontrol.
7. **STATUS semuanya `DONE`** di data historis (tidak ada PENDING) — konsisten dengan alur lama, tapi aplikasi baru default `PENDING`.
8. **Nama supplier mentah** (kolom C) tidak selalu = master (`DATA SUPPLIER 2`) → perlu normalisasi & alias (mis. `HD JAYA SYRUP` vs master).
9. **TGL INVOICE bulan Juni** muncul di tab Juli (mis. `2026-06-03`) → tanggal invoice ≠ tanggal pengajuan; keduanya harus disimpan terpisah.

---

## 10. Perbedaan Antar-Tab & Acuan
Tab pengajuan per-tanggal (`3/7/10/14/17/21/31 JULI`) adalah kertas kerja; tab **`PENGAJUAN JULI <ENTITAS>`** adalah kompilasi berjalan; **`REPORT UPDATE PENGAJUAN`** (19.591 baris) adalah master log. **Acuan struktur kolom = `PENGAJUAN JULI KNU`** (paling bersih, 17 kolom A–Q, dropdown & format lengkap). Keputusan ini dipakai konsisten di aplikasi.
