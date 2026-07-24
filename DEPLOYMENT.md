import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { assertRole } from "@/server/guards";
import { appendRows, SheetRowAtoO } from "@/services/sheets";

// Hanya batch APPROVED. Append-only, cek duplikat. Simpan metadata sync.
export async function POST(req: NextRequest) {
  let userId: string;
  try { ({ userId } = await assertRole(["APPROVER"])); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }
  const sb = await supabaseServer();
  const { batchId, spreadsheetId, sheetName } = await req.json();
  const { data: batch } = await sb.from("batches").select("status").eq("id", batchId).single();
  if (batch?.status !== "APPROVED" && batch?.status !== "EXPORTED") return NextResponse.json({ error: "batch belum APPROVED" }, { status: 409 });
  const { data: integ } = await sb.from("integrations").select("config").eq("kind", "google_sheets").maybeSingle();
  const tokens = (integ?.config as { tokens?: Record<string, unknown> })?.tokens;
  if (!tokens) return NextResponse.json({ error: "Google Sheets belum terhubung" }, { status: 409 });
  const { data } = await sb.from("submission_rows").select("*").eq("batch_id", batchId).eq("outlet", sheetName.replace("PENGAJUAN ", ""));
  const rows: SheetRowAtoO[] = (data ?? []).map((r) => ({ compositeKey: r.composite_key ?? "", values: [r.tgl_invoice, r.outlet, r.supplier, r.sku, r.rincian, r.qty, r.satuan, r.harga_satuan, r.total, r.pos, r.keterangan, r.jatuh_tempo, r.tgl_pengajuan, r.invoice, r.status_pengajuan] }));
  const res = await appendRows(tokens, spreadsheetId, sheetName, rows);
  await sb.from("exports").insert({ batch_id: batchId, kind: "sheets_append", target: { spreadsheetId, sheetName }, row_count: res.appended, status: "DONE", created_by: userId });
  await sb.from("audit_logs").insert({ actor: userId, action: "SYNC", object_type: "batch", object_id: batchId, after: res });
  return NextResponse.json(res);
}
