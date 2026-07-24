import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { buildWorkbook, exportFilename, PengajuanRow, SummaryRow } from "@/services/excel-export";

// POST /api/export  { batchId }  → XLSX (server-side, hanya baris APPROVED)
export async function POST(req: NextRequest) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { batchId } = await req.json();

  const { data: batch } = await sb.from("batches").select("id,name,status,submission_date").eq("id", batchId).single();
  if (!batch) return NextResponse.json({ error: "batch tidak ditemukan" }, { status: 404 });
  if (batch.status !== "APPROVED" && batch.status !== "EXPORTED")
    return NextResponse.json({ error: "batch belum APPROVED" }, { status: 409 });

  const { data: rows } = await sb.from("submission_rows").select("*").eq("batch_id", batchId);
  const byEntity = new Map<string, PengajuanRow[]>();
  for (const r of rows ?? []) {
    const pr: PengajuanRow = {
      tgl_invoice: r.tgl_invoice ? new Date(r.tgl_invoice + "T00:00:00Z") : null,
      outlet: r.outlet, supplier: r.supplier, sku: r.sku ?? "", rincian: r.rincian ?? "",
      qty: r.qty, satuan: r.satuan ?? "", harga_satuan: r.harga_satuan, pos: r.pos ?? "",
      keterangan: r.keterangan ?? "", jatuh_tempo: r.jatuh_tempo ? new Date(r.jatuh_tempo + "T00:00:00Z") : null,
      tgl_pengajuan: r.tgl_pengajuan ? new Date(r.tgl_pengajuan + "T00:00:00Z") : null,
      invoice: r.invoice ?? "", status_pengajuan: r.status_pengajuan, checkbox: r.checkbox,
    };
    if (!byEntity.has(r.outlet)) byEntity.set(r.outlet, []);
    byEntity.get(r.outlet)!.push(pr);
  }
  const summary: SummaryRow[] = [];
  const label = (batch.submission_date ?? new Date().toISOString().slice(0, 10)).replace(/-/g, "_");
  const buf = await buildWorkbook({ entities: [...byEntity].map(([name, rows]) => ({ name, rows })), summary, batchDateLabel: label });
  await sb.from("exports").insert({ batch_id: batchId, kind: "xlsx", target: { filename: exportFilename(label) }, row_count: rows?.length ?? 0, status: "DONE", created_by: user.id });
  await sb.from("audit_logs").insert({ actor: user.id, action: "EXPORT", object_type: "batch", object_id: batchId });
  return new NextResponse(buf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${exportFilename(label)}"`,
    },
  });
}
