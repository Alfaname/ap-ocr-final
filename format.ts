import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { assertRole } from "@/server/guards";
import { validateInvoice } from "@/lib/validation";

// PATCH: koreksi header/item. Nilai OCR asli TIDAK ditimpa (kolom *_ocr). Re-validate.
export async function PATCH(req: NextRequest) {
  let userId: string;
  try { ({ userId } = await assertRole(["REVIEWER", "APPROVER"])); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }
  const sb = await supabaseServer();
  const body = await req.json() as { invoiceId: string; header?: Record<string, unknown>; items?: { id: string; patch: Record<string, unknown> }[]; markReviewed?: boolean };

  if (body.header) {
    const before = await sb.from("invoices").select("*").eq("id", body.invoiceId).single();
    await sb.from("invoices").update({ ...body.header, updated_by: userId }).eq("id", body.invoiceId);
    await sb.from("audit_logs").insert({ actor: userId, action: "EDIT", object_type: "invoice", object_id: body.invoiceId, before: before.data, after: body.header });
  }
  for (const it of body.items ?? []) {
    await sb.from("invoice_items").update(it.patch).eq("id", it.id);
  }
  // re-validate
  const { data: items } = await sb.from("invoice_items").select("quantity,unit_price,line_total").eq("invoice_id", body.invoiceId);
  const { data: inv } = await sb.from("invoices").select("discount,tax,shipping,other_charges,rounding,grand_total").eq("id", body.invoiceId).single();
  const val = validateInvoice({ items: items ?? [], ...inv! });
  await sb.from("validation_results").insert({ invoice_id: body.invoiceId, state: val.state, line_item_total: val.line_item_total, calculated_grand_total: val.calculated_grand_total, difference: val.difference, difference_pct: val.difference_pct });
  if (body.markReviewed) await sb.from("invoices").update({ review_status: "REVIEWED" }).eq("id", body.invoiceId);
  await sb.from("audit_logs").insert({ actor: userId, action: "REVIEW", object_type: "invoice", object_id: body.invoiceId });
  return NextResponse.json({ validation: val });
}
