import Link from "next/link";
import { AppShell } from "@/components/Sidebar";
import { Card, Button, Badge } from "@/components/ui";
import { UploadDropzone } from "@/components/UploadDropzone";
import { supabaseServer } from "@/lib/supabase/server";
import { iddate } from "@/lib/format";
export default async function BatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const sb = await supabaseServer();
  const { data: batch } = await sb.from("batches").select("*").eq("id", id).single();
  const { data: docs } = await sb.from("documents").select("*").eq("batch_id", id).order("seq");
  if (!batch) return <AppShell><p>Batch tidak ditemukan.</p></AppShell>;
  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <div><h1 className="text-xl font-semibold">{batch.name}</h1><p className="text-sm text-neutral-500">{batch.entity_code} · {iddate(batch.submission_date, true)} · <Badge className="bg-neutral-100">{batch.status}</Badge></p></div>
        <Link href={`/batches/${id}/review`}><Button>Buka Review</Button></Link>
      </div>
      <Card className="mb-4"><h2 className="mb-2 text-sm font-semibold">Unggah Dokumen</h2><UploadDropzone batchId={id} /></Card>
      <Card className="p-0"><table className="w-full text-sm"><thead className="bg-brand-light text-left"><tr>{["File","Tipe","Status","Flag"].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
        <tbody>{(docs ?? []).map((d) => <tr key={d.id} className="border-t"><td className="p-2">{d.original_filename}</td><td className="p-2">{d.mime_type}</td><td className="p-2">{d.status}</td><td className="p-2 text-xs text-amber-600">{(d.quality_flags ?? []).join(", ")}</td></tr>)}
        {!docs?.length && <tr><td colSpan={4} className="p-4 text-center text-neutral-400">Belum ada dokumen.</td></tr>}</tbody></table></Card>
    </AppShell>
  );
}
