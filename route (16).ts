import { AppShell } from "@/components/Sidebar";
import { Card } from "@/components/ui";
import { supabaseServer } from "@/lib/supabase/server";
import { idnum } from "@/lib/format";
export default async function MasterProducts() {
  const sb = await supabaseServer();
  const { data } = await sb.from("products").select("*").order("sku").limit(2000);
  return (
    <AppShell>
      <h1 className="mb-4 text-xl font-semibold">Master SKU / Produk</h1>
      <Card className="p-0 overflow-x-auto"><table className="w-full text-sm">
        <thead className="bg-brand-light text-left"><tr>{["SKU","Nama","Dept","Kategori","UOM","Gramasi"].map((h) => <th key={h} className="p-2 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{(data ?? []).map((p) => <tr key={p.id} className="border-t"><td className="p-2 font-mono">{p.sku}</td><td className="p-2">{p.name}</td><td className="p-2">{p.department_name}</td><td className="p-2">{p.category_name}</td><td className="p-2">{p.uom}</td><td className="p-2">{idnum(p.gramasi)}</td></tr>)}
        {!data?.length && <tr><td colSpan={6} className="p-4 text-center text-neutral-400">Belum ada produk. Impor melalui Integrasi.</td></tr>}</tbody></table></Card>
    </AppShell>
  );
}
