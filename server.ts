import { NextRequest, NextResponse } from "next/server";
import { oauthClient } from "@/services/google-auth";
import { supabaseServer } from "@/lib/supabase/server";
import { assertRole } from "@/server/guards";
export async function GET(req: NextRequest) {
  try { await assertRole(["ADMIN"]); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }
  const code = req.nextUrl.searchParams.get("code"); if (!code) return NextResponse.json({ error: "no code" }, { status: 400 });
  const { tokens } = await oauthClient().getToken(code);
  const sb = await supabaseServer();
  await sb.from("integrations").upsert({ kind: "google_drive", config: { tokens } });
  return NextResponse.redirect(new URL("/integrations", process.env.APP_BASE_URL));
}
