import Link from "next/link";
import { AppShell } from "@/components/Sidebar";
import { Button, Card, Badge } from "@/components/ui";
import { supabaseServer } from "@/lib/supabase/server";
import { iddate, idnum } from "@/lib/format";
export default async function Batches() {
  const sb = await supabaseServer();
  const { data: batches } = await sb.from("batches").select("*").order("created_at", { ascending: false });
  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Batch Pengajuan</h1>
        <Link href="/batches/new"><Button>+ Batch Baru</Button></Link>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-brand-light text-left"><tr>{["Nama","Entitas","Tgl Pengajuan","Status","Dibuat"].map((h) => <th key={h} className="p-2 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {(batches ?? []).map((b) => (
              <tr key={b.id} className="border-t"><td className="p-2"><Link href={`/batches/${b.id}`} className="text-brand hover:underline">{b.name}</Link></td>
                <td className="p-2">{b.entity_code}</td><td className="p-2">{iddate(b.submission_date, true)}</td>
                <td className="p-2"><Badge className="bg-neutral-100">{b.status}</Badge></td><td className="p-2">{iddate(b.created_at)}</td></tr>
            ))}
            {!batches?.length && <tr><td colSpan={5} className="p-6 text-center text-neutral-400">Belum ada batch.</td></tr>}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
