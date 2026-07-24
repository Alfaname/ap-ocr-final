import { AppShell } from "@/components/Sidebar";
import { Card } from "@/components/ui";
import { supabaseServer } from "@/lib/supabase/server";
import { maskAccount, canSeeFullAccount } from "@/lib/mask";
import { currentUserRoles } from "@/server/guards";
export default async function MasterSuppliers() {
  const sb = await supabaseServer(); const { roles } = await currentUserRoles();
  const full = canSeeFullAccount(roles);
  const { data } = await sb.from("suppliers").select("*").order("nama_supplier").limit(1000);
  return (
    <AppShell>
      <h1 className="mb-4 text-xl font-semibold">Master Supplier</h1>
      <Card className="p-0 overflow-x-auto"><table className="w-full text-sm">
        <thead className="bg-brand-light text-left"><tr>{["Supplier","TOP","Metode","Bank","Pemilik","No. Rekening","Kriteria"].map((h) => <th key={h} className="p-2 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{(data ?? []).map((s) => <tr key={s.id} className="border-t"><td className="p-2">{s.nama_supplier}</td><td className="p-2">{s.term_of_payment}</td><td className="p-2">{s.payment_method}</td><td className="p-2">{s.nama_bank}</td><td className="p-2">{s.pemilik_rekening}</td><td className="p-2 font-mono">{full ? s.no_rekening : maskAccount(s.no_rekening)}</td><td className="p-2">{s.kriteria}</td></tr>)}
        {!data?.length && <tr><td colSpan={7} className="p-4 text-center text-neutral-400">Belum ada supplier. Impor melalui Integrasi.</td></tr>}</tbody></table></Card>
      {!full && <p className="mt-2 text-xs text-neutral-400">Nomor rekening dimasker. Hanya ADMIN/APPROVER dapat melihat penuh.</p>}
    </AppShell>
  );
}
