import { AppShell } from "@/components/Sidebar";
import { Stat, Card } from "@/components/ui";
import { supabaseServer } from "@/lib/supabase/server";
import { idnum } from "@/lib/format";
export default async function Dashboard() {
  const sb = await supabaseServer();
  const count = async (t: string, f?: (q: any) => any) => { let q = sb.from(t).select("*", { count: "exact", head: true }); if (f) q = f(q); const { count } = await q; return count ?? 0; };
  const [batches, docs, invoices, rows] = await Promise.all([count("batches"), count("documents"), count("invoices"), count("submission_rows")]);
  const { data: totalRows } = await sb.from("submission_rows").select("outlet,total");
  const total = (totalRows ?? []).reduce((s, r) => s + Number(r.total ?? 0), 0);
  const gnu = (totalRows ?? []).filter((r) => r.outlet === "GNU").reduce((s, r) => s + Number(r.total ?? 0), 0);
  const knu = (totalRows ?? []).filter((r) => r.outlet === "KNU").reduce((s, r) => s + Number(r.total ?? 0), 0);
  const needReview = await count("invoices", (q) => q.eq("review_status", "NEEDS_REVIEW"));
  const failed = await count("documents", (q) => q.eq("status", "FAILED"));
  return (
    <AppShell>
      <h1 className="mb-4 text-xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Batch" value={batches} /><Stat label="Dokumen" value={docs} />
        <Stat label="Invoice" value={invoices} /><Stat label="Baris item" value={rows} />
        <Stat label="Total pengajuan" value={idnum(total)} /><Stat label="Total GNU" value={idnum(gnu)} />
        <Stat label="Total KNU" value={idnum(knu)} /><Stat label="Menunggu review" value={needReview} hint={`${failed} gagal proses`} />
      </div>
      <Card className="mt-4"><p className="text-sm text-neutral-500">Grafik total per tanggal/entitas/supplier tersedia setelah data pengajuan terisi.</p></Card>
    </AppShell>
  );
}
