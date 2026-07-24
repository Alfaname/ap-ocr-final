import { AppShell } from "@/components/Sidebar";
import { Card } from "@/components/ui";
import { supabaseServer } from "@/lib/supabase/server";
import { iddate } from "@/lib/format";
export default async function Documents() {
  const sb = await supabaseServer();
  const { data } = await sb.from("documents").select("*").order("created_at", { ascending: false }).limit(500);
  return (
    <AppShell>
      <h1 className="mb-4 text-xl font-semibold">Arsip Dokumen</h1>
      <Card className="p-0 overflow-x-auto"><table className="w-full text-sm">
        <thead className="bg-brand-light text-left"><tr>{["File","Tipe","Status","Checksum","Diunggah"].map((h) => <th key={h} className="p-2 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{(data ?? []).map((d) => <tr key={d.id} className="border-t"><td className="p-2">{d.original_filename}</td><td className="p-2">{d.mime_type}</td><td className="p-2">{d.status}</td><td className="p-2 font-mono text-xs">{String(d.sha256).slice(0, 12)}…</td><td className="p-2">{iddate(d.created_at)}</td></tr>)}
        {!data?.length && <tr><td colSpan={5} className="p-4 text-center text-neutral-400">Belum ada dokumen.</td></tr>}</tbody></table></Card>
    </AppShell>
  );
}
