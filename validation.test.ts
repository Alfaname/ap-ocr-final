# DATA_MAPPING.md
Pemetaan field dokumen sumber → OCR mentah → normalisasi → kolom output (tab pengajuan `A–Q`).
Locale `id-ID`, timezone `Asia/Jakarta`. Sumber master: `SKU PRODUCT` (871 SKU) & `DATA SUPPLIER 2` (±49 supplier).

Legenda tipe: `date`, `string`, `decimal`, `int`, `numeric(15,2)`, `bool`, `url`.
`Confidence Minimum` = ambang auto-accept; di bawahnya → **Perlu Review**.

## A. Header Invoice

| Field Dokumen | Contoh Nilai | Field OCR Mentah | Field Normalisasi | Kolom Output | Tipe | Wajib/Opsional | Sumber Master | Aturan Validasi | Fallback | Conf. Min | Perlu Review |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Tanggal invoice | `02/07/2026` | `invoice_date_raw` | `invoice_date` (ISO) | **A TGL INVOICE** | date | Wajib | — | Parse id-ID (dd/mm/yyyy, "2 Juli 2026"); tahun wajar 2024–2027 | `null` (jangan pakai tgl upload) | 0.90 | jika null/ambigu |
| Outlet/Entitas | `KNU` | `entity_detected` | `outlet` | **B OUTLET** | string | Wajib | master `entities` (GNU,KNU,GDN,SGP,TSK) | ∈ master entitas | dari batch/folder hint | 0.80 | jika tak ada di master |
| Supplier/vendor | `PT HD JAYA` | `supplier_raw` | `supplier_normalized`+`supplier_id` | **C SUPPLIER/VENDOR** | string | Wajib | `DATA SUPPLIER 2` | fuzzy match; exact/alias→auto | simpan raw, id=null | 0.92 exact | jika fuzzy < 0.92 |
| Nomor invoice | `INV/0012` | `invoice_number_raw` | `invoice_number_normalized` | **N INVOICE** | string | Opsional | — | **selalu string**, pertahankan nol depan | `""` | 0.85 | jika ragu |
| Jatuh tempo | `09/07/2026` | `due_date_raw` | `due_date` | **L JATUH TEMPO** | date | Opsional | TOP supplier | =TGL INVOICE + TOP hari | hitung dari TOP (label "Dihitung dari TOP") | 0.85 | jika beda dgn hitung |
| Tanggal pengajuan | `03 Juli 2026` | — | `submission_date` | **M TGL PENGAJUAN** | date | Wajib | dari batch | ambil dari batch | tgl batch | — (dari batch) | tidak |
| PO number | `PO-123` | `purchase_order_number` | idem | (metadata) | string | Opsional | — | string | `""` | — | tidak |
| No. faktur pajak | `010.xxx` | `tax_invoice_number` | idem | (metadata) | string | Opsional | — | string | `""` | — | tidak |
| Payment terms | `TOP 7` | `payment_terms` | `top_days` (int) | (metadata→L) | int | Opsional | supplier | angka hari | dari master supplier | — | tidak |

## B. Total & Adjustment (level invoice)

| Field Dokumen | Contoh | OCR Mentah | Normalisasi | Kolom Output | Tipe | W/O | Master | Validasi | Fallback | Conf | Review |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Subtotal | `1.500.000` | `subtotal_raw` | `subtotal` | validasi | numeric(15,2) | Opsional | — | angka id-ID | `null` | 0.85 | jika mismatch |
| Diskon | `50.000` | `discount_raw` | `discount` | adjustment | numeric | Opsional | — | ≥0 | 0 | 0.85 | ya jika ada |
| PPN/pajak | `165.000` | `tax_raw` | `tax` | adjustment | numeric | Opsional | — | ≥0; cek ~11% | 0 | 0.85 | ya |
| Ongkir | `25.000` | `shipping_raw` | `shipping` | adjustment (POS=ONGKIR) | numeric | Opsional | — | ≥0 | 0 | 0.85 | ya |
| Biaya lain | `10.000` | `other_charges_raw` | `other_charges` | adjustment | numeric | Opsional | — | ≥0 | 0 | 0.80 | ya |
| Pembulatan | `-500` | `rounding_raw` | `rounding` | adjustment | numeric | Opsional | — | kecil | 0 | 0.80 | tidak |
| Grand total | `1.650.000` | `grand_total_raw` | `grand_total` | rekonsiliasi | numeric | Wajib | — | = Σitem − disk + pajak + ongkir + lain + bulat | `null` | 0.90 | jika ≠ hitung |

## C. Line Item → satu baris tabel per item

| Field Dokumen | Contoh | OCR Mentah | Normalisasi | Kolom Output | Tipe | W/O | Master | Validasi | Fallback | Conf | Review |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Rincian produk | `SYRUP DENALI STRAWBERRY 2 L` | `raw_description` | `normalized_description`+`product_master_id` | **E RINCIAN** | string | Wajib | `SKU PRODUCT!H (NAME)` | match ke master NAME | simpan raw, id=null | 0.90 exact | jika < 0.90 |
| SKU | `4007250010` | (turunan) | `sku` | **D SKU** | string | Opsional | `SKU PRODUCT!G` | `INDEX(G,MATCH(E,H,0))`; jangan dipaksakan | `""` (unmapped→log) | — | jika kosong |
| QTY | `3` / `1,06` | `quantity_raw` | `quantity` | **F QTY** | decimal | Wajib | — | angka id-ID; **jangan dibulatkan** | `null` | 0.90 | jika null |
| Satuan | `BTL` | `unit_raw` | `unit_normalized` | **G SATUAN** | string | Wajib | `SKU PRODUCT!I (UOM)` | dari master via lookup; boleh dikoreksi | dari OCR raw | 0.85 | jika beda master |
| Harga satuan | `97.402,5` | `unit_price_raw` | `unit_price` | **H HARGA SATUAN** | numeric | Wajib | referensi harga kota | angka id-ID; simpan numeric | `null` | 0.90 | jika null / jauh dari ref |
| Diskon item | `0` | `discount_raw` | `discount` | (metadata item) | numeric | Opsional | — | ≥0 | 0 | 0.80 | jika ada |
| Total baris | `292.207,5` | `line_total_raw` | `line_total` | **I TOTAL** | numeric | Wajib | — | **default =F×H**; simpan juga total OCR asli | hitung F×H | 0.90 | jika \|OCR−hitung\|>toleransi |
| POS/kategori | `BAHAN BAKU` | (klasifikasi) | `pos` | **J POS** | enum | Opsional | dropdown POS | ∈ {BAHAN BAKU,SERVICE,GAS,BARANG JADI,KEMASAN,BENSIN,ONGKIR,LAINNYA,EDR} | `LAINNYA` | — | manual |
| Keterangan | teks bebas | `notes` | idem | **K KETERANGAN** | string | Opsional | — | jangan gabung dgn nomor invoice | `""` | — | tidak |
| Halaman sumber | `1` | `source_page` | idem | metadata | int | Wajib | — | ≥1 | 1 | — | tidak |
| Bounding box | koordinat | `bounding_box` | idem | metadata (highlight) | json | Opsional | — | — | `null` | — | tidak |

## D. Metadata Dokumen & Traceability

| Field | OCR/Sumber | Kolom Output | Tipe | Catatan |
|---|---|---|---|---|
| Status pengajuan | default sistem | **O STATUS PENGAJUAN** | enum {DONE,PENDING} | **default `PENDING`**; jangan auto-DONE |
| Composite key | turunan A–O | **P** | string | `=IF(OR(C="",E=""),"",TEXTJOIN("♦️",FALSE,IF(A:O="","∅",TRIM(...))))` — bukan PK DB |
| Checkbox | operasional | **Q** | bool | default `false` |
| Folder/link dokumen | Drive/storage | `document.web_view_link` | url | signed URL; buka sumber |
| Nama file asli | upload | `document.original_filename` | string | disanitasi |
| Nomor halaman | pipeline | `document_pages.page_no` | int | multi-halaman |
| Checksum | pipeline | `documents.sha256` | string | anti-duplikat file |

## E. Aturan Angka Indonesia (kritis)
- `1.500` = 1500 (titik = ribuan) · `1,50` = 1.5 (koma = desimal) · `1.500,50` = 1500.5.
- Simpan semua nominal sebagai `numeric`, **bukan** string berformat. Pertahankan nol depan hanya untuk `INVOICE` & `NO REKENING` (string).
- QTY tidak boleh terbaca sebagai tanggal.

## F. Prioritas Mapping Supplier (dari §L brief)
`exact → alias terverifikasi → fuzzy tinggi (rekomendasi) → fuzzy rendah (manual) → supplier baru (draft, butuh approval)`. Setelah cocok, ambil dari `DATA SUPPLIER 2`: TERM OF PAYMENT, PAYMENT METHOD, NAMA BANK, PEMILIK REKENING, NO REKENING (**masked**), KRITERIA.

## G. Prioritas Mapping Produk (dari §M brief)
`exact normalized name → alias produk disetujui → token similarity → brand/ukuran/gramasi/kemasan → supplier-specific alias → manual`. Bedakan tegas ukuran/kemasan (`SANTAN 200 ML` ≠ `SANTAN 1 L`). Maks 5 kandidat + similarity + alasan.
