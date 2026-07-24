import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { assertRole } from "@/server/guards";
import { previewAppend, SheetRowAtoO } from "@/services/sheets";

export async function POST(req: NextRequest) {
  try { await assertRole(["APPROVER"]); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }
  const sb = await supabaseServer();
  const { batchId, spreadsheetId, sheetName } = await req.json();
  const { data: integ } = await sb.from("integrations").select("config").eq("kind", "google_sheets").maybeSingle();
  const tokens = (integ?.config as { tokens?: Record<string, unknown> })?.tokens;
  if (!tokens) return NextResponse.json({ error: "Google Sheets belum terhubung" }, { status: 409 });
  const rows = await rowsForBatch(sb, batchId, sheetName);
  const preview = await previewAppend(tokens, spreadsheetId, sheetName, rows);
  return NextResponse.json(preview);
}
async function rowsForBatch(sb: Awaited<ReturnType<typeof supabaseServer>>, batchId: string, outlet: string): Promise<SheetRowAtoO[]> {
  const { data } = await sb.from("submission_rows").select("*").eq("batch_id", batchId).eq("outlet", outlet.replace("PENGAJUAN ", ""));
  return (data ?? []).map((r) => ({ compositeKey: r.composite_key ?? "", values: [
    r.tgl_invoice, r.outlet, r.supplier, r.sku, r.rincian, r.qty, r.satuan, r.harga_satuan, r.total, r.pos, r.keterangan, r.jatuh_tempo, r.tgl_pengajuan, r.invoice, r.status_pengajuan,
  ] }));
}
