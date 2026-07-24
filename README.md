import { z } from "zod";
// Skema hasil OCR — structured output tervalidasi (brief §J). null bila tidak terbaca.
const conf = z.number().min(0).max(1);

export const LineItem = z.object({
  line_number: z.number().int().min(1),
  raw_description: z.string(),
  normalized_description: z.string().default(""),
  sku: z.string().default(""),
  product_master_id: z.string().uuid().nullable().default(null),
  quantity_raw: z.string().default(""),
  quantity: z.number().nullable(),
  unit_raw: z.string().default(""),
  unit_normalized: z.string().default(""),
  unit_price_raw: z.string().default(""),
  unit_price: z.number().nullable(),
  discount: z.number().nullable().default(null),
  tax: z.number().nullable().default(null),
  line_total_raw: z.string().default(""),
  line_total: z.number().nullable(),
  source_page: z.number().int().min(1).default(1),
  bounding_box: z.any().nullable().default(null),
  confidence: z.object({
    description: conf, quantity: conf, unit: conf, unit_price: conf, line_total: conf,
  }),
  warnings: z.array(z.string()).default([]),
});

export const OcrDocument = z.object({
  document_type: z.enum(["INVOICE","RECEIPT","NOTA_PASAR","PURCHASE_ORDER","DELIVERY_NOTE","TAX_INVOICE","EMAIL_ATTACHMENT","PAYMENT_SUPPORT","UNKNOWN"]),
  language: z.string().default("id"),
  currency: z.string().default("IDR"),
  entity_detected: z.string().default(""),
  outlet_detected: z.string().default(""),
  supplier_raw: z.string().default(""),
  supplier_normalized: z.string().default(""),
  supplier_id: z.string().uuid().nullable().default(null),
  invoice_number_raw: z.string().default(""),
  invoice_number_normalized: z.string().default(""),
  invoice_date_raw: z.string().default(""),
  invoice_date: z.string().nullable(),      // ISO yyyy-mm-dd
  due_date_raw: z.string().default(""),
  due_date: z.string().nullable(),
  purchase_order_number: z.string().default(""),
  tax_invoice_number: z.string().default(""),
  payment_terms: z.string().default(""),
  subtotal: z.number().nullable(), discount: z.number().nullable(), tax: z.number().nullable(),
  shipping: z.number().nullable(), other_charges: z.number().nullable(), rounding: z.number().nullable(),
  grand_total: z.number().nullable(),
  notes: z.string().default(""),
  page_count: z.number().int().min(1).default(1),
  overall_confidence: conf,
  warnings: z.array(z.string()).default([]),
});

export const OcrResult = z.object({
  document: OcrDocument,
  line_items: z.array(LineItem),
  unclassified_text: z.array(z.string()).default([]),
  validation_summary: z.object({
    line_item_total: z.number().nullable(),
    calculated_grand_total: z.number().nullable(),
    difference: z.number().nullable(),
    is_balanced: z.boolean().default(false),
  }),
});
export type OcrResult = z.infer<typeof OcrResult>;
export type LineItem = z.infer<typeof LineItem>;

export const DocClassification = z.object({
  document_type: OcrDocument.shape.document_type,
  confidence: conf,
  reason: z.string(),
});
