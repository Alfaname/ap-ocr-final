import { AppShell } from "@/components/Sidebar";
import { Card } from "@/components/ui";
import { supabaseServer } from "@/lib/supabase/server";
import { iddate } from "@/lib/format";
export default async function AuditLog() {
  const sb = await supabaseServer();
  const { data } = await sb.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500);
  return (
    <AppShell>
      <h1 className="mb-4 text-xl font-semibold">Audit Log</h1>
      <Card className="p-0 overflow-x-auto"><table className="w-full text-sm">
        <thead className="bg-brand-light text-left"><tr>{["Waktu","Aksi","Objek","ID Objek","Aktor"].map((h) => <th key={h} className="p-2 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{(data ?? []).map((a) => <tr key={a.id} className="border-t"><td className="p-2">{iddate(a.created_at, true)}</td><td className="p-2">{a.action}</td><td className="p-2">{a.object_type}</td><td className="p-2 font-mono text-xs">{String(a.object_id ?? "").slice(0, 8)}</td><td className="p-2 font-mono text-xs">{String(a.actor ?? "").slice(0, 8)}</td></tr>)}
        {!data?.length && <tr><td colSpan={5} className="p-4 text-center text-neutral-400">Belum ada aktivitas.</td></tr>}</tbody></table></Card>
    </AppShell>
  );
}
