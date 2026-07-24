import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { assertRole } from "@/server/guards";
import { buildCompositeKey } from "@/lib/composite-key";

// Approve invoice → generate submission_rows (final A–Q). Field kritis merah wajib sudah direview.
export async function POST(req: NextRequest) {
  let userId: string;
  try { ({ userId } = await assertRole(["APPROVER"])); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }
  const sb = await supabaseServer();
  const { invoiceId } = await req.json();

  const { data: inv } = await sb.from("invoices").select("*").eq("id", invoiceId).single();
  if (!inv) return NextResponse.json({ error: "invoice tidak ditemukan" }, { status: 404 });
  // guard: field kritis confidence merah harus sudah direview
  const { data: items } = await sb.from("invoice_items").select("*").eq("invoice_id", invoiceId).order("line_number");
  if (inv.review_status !== "REVIEWED") return NextResponse.json({ error: "invoice belum ditandai REVIEWED" }, { status: 409 });

  const { data: batch } = await sb.from("batches").select("submission_date").eq("id", inv.batch_id).single();
  const rows = (items ?? []).map((it) => {
    const fmt = (n: number | null) => (n == null ? "" : n.toLocaleString("id-ID", { maximumFractionDigits: 0 }));
    const total = (it.quantity ?? 0) * (it.unit_price ?? 0);
    const ck = buildCompositeKey([
      inv.invoice_date ?? "", inv.entity_code ?? "", inv.supplier_raw ?? "", it.sku ?? "", it.normalized_description ?? it.raw_description ?? "",
      it.quantity == null ? "" : it.quantity.toLocaleString("id-ID", { minimumFractionDigits: 2 }), it.unit ?? "",
      fmt(it.unit_price), fmt(total), it.pos ?? "", it.keterangan ?? "", inv.due_date ?? "", batch?.submission_date ?? "", inv.invoice_number ?? "", "PENDING",
    ]);
    return {
      batch_id: inv.batch_id, invoice_id: invoiceId, invoice_item_id: it.id,
      tgl_invoice: inv.invoice_date, outlet: inv.entity_code, supplier: inv.supplier_raw,
      sku: it.sku, rincian: it.normalized_description ?? it.raw_description, qty: it.quantity, satuan: it.unit,
      harga_satuan: it.unit_price, total, pos: it.pos, keterangan: it.keterangan,
      jatuh_tempo: inv.due_date, tgl_pengajuan: batch?.submission_date, invoice: inv.invoice_number,
      status_pengajuan: "PENDING", composite_key: ck, checkbox: false, created_by: userId,
    };
  });
  if (rows.length) await sb.from("submission_rows").insert(rows);
  await sb.from("invoices").update({ review_status: "APPROVED", approved_by: userId, approved_at: new Date().toISOString() }).eq("id", invoiceId);
  await sb.from("approval_actions" as never).insert({ invoice_id: invoiceId, approver: userId } as never).select().then(() => {}, () => {});
  await sb.from("audit_logs").insert({ actor: userId, action: "APPROVE", object_type: "invoice", object_id: invoiceId });
  return NextResponse.json({ inserted: rows.length });
}
