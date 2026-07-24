import { AppShell } from "@/components/Sidebar";
import { Card } from "@/components/ui";
import { ReviewPanel } from "@/components/ReviewPanel";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
export default async function Review({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const sb = await supabaseServer();
  const { data: invoices } = await sb.from("invoices").select("*").eq("batch_id", id).order("created_at");
  const first = invoices?.[0];
  let items: any[] = []; let previewUrl: string | undefined;
  if (first) {
    const r = await sb.from("invoice_items").select("*").eq("invoice_id", first.id).order("line_number"); items = r.data ?? [];
    const { data: doc } = await sb.from("documents").select("storage_path").eq("id", first.document_id).maybeSingle();
    if (doc) { const signed = await supabaseAdmin().storage.from(process.env.SUPABASE_STORAGE_BUCKET!).createSignedUrl(`${doc.storage_path}.preview.jpg`, Number(process.env.SIGNED_URL_TTL_SECONDS ?? 300)); previewUrl = signed.data?.signedUrl; }
  }
  return (
    <AppShell>
      <h1 className="mb-4 text-xl font-semibold">Review Hasil OCR</h1>
      {first ? <ReviewPanel invoice={first as any} items={items} previewUrl={previewUrl} />
        : <Card><p className="text-sm text-neutral-400">Belum ada invoice untuk direview. Unggah & proses dokumen terlebih dahulu.</p></Card>}
    </AppShell>
  );
}
