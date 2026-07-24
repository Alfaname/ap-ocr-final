import { AppShell } from "@/components/Sidebar";
import { Card } from "@/components/ui";
import { supabaseServer } from "@/lib/supabase/server";
import { idnum } from "@/lib/format";
export default async function Ringkasan() {
  const sb = await supabaseServer();
  const { data } = await sb.from("submission_rows").select("outlet,supplier,invoice,total,tgl_invoice");
  const map = new Map<string, { supplier: string; outlet: string; nominal: number; invoices: Set<string> }>();
  for (const r of data ?? []) {
    const k = `${r.outlet}|${r.supplier}`; const e = map.get(k) ?? { supplier: r.supplier, outlet: r.outlet, nominal: 0, invoices: new Set() };
    e.nominal += Number(r.total ?? 0); if (r.invoice) e.invoices.add(r.invoice); map.set(k, e);
  }
  const list = [...map.values()].sort((a, b) => a.outlet.localeCompare(b.outlet) || b.nominal - a.nominal);
  const totalBy = (o: string) => list.filter((x) => x.outlet === o).reduce((s, x) => s + x.nominal, 0);
  return (
    <AppShell>
      <h1 className="mb-4 text-xl font-semibold">Ringkasan Tagihan per Supplier</h1>
      <Card className="p-0 overflow-x-auto"><table className="w-full text-sm">
        <thead className="bg-brand-light text-left"><tr>{["NO","SUPPLIER/VENDOR","OUTLET","NOMINAL","INVOICE","STATUS PAYMENT"].map((h) => <th key={h} className="p-2 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{list.map((x, i) => <tr key={i} className="border-t"><td className="p-2">{i + 1}</td><td className="p-2">{x.supplier}</td><td className="p-2">{x.outlet}</td><td className="p-2 text-right">{idnum(x.nominal)}</td><td className="p-2">{[...x.invoices].join(", ")}</td><td className="p-2">Pending</td></tr>)}
        {!list.length && <tr><td colSpan={6} className="p-4 text-center text-neutral-400">Belum ada data.</td></tr>}</tbody>
        {list.length > 0 && <tfoot className="bg-neutral-100 font-semibold"><tr><td colSpan={3} className="p-2">Total GNU</td><td className="p-2 text-right">{idnum(totalBy("GNU"))}</td><td colSpan={2}></td></tr><tr><td colSpan={3} className="p-2">Total KNU</td><td className="p-2 text-right">{idnum(totalBy("KNU"))}</td><td colSpan={2}></td></tr></tfoot>}
      </table></Card>
    </AppShell>
  );
}
