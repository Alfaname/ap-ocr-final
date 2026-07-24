import { NextRequest, NextResponse } from "next/server";
import { assertRole } from "@/server/guards";
import { processDocument } from "@/server/pipeline/process-document";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rl = rateLimit(clientKey(req, "ocr"), 60, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate limit terlampaui" }, { status: 429 });
  try { await assertRole(["UPLOADER", "REVIEWER"]); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }
  const { id } = await params;
  try { const r = await processDocument(id); return NextResponse.json(r); }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }); }
}
