import { AppShell } from "@/components/Sidebar";
import { PengajuanTable, Row } from "@/components/PengajuanTable";
import { supabaseServer } from "@/lib/supabase/server";
export default async function Pengajuan() {
  const sb = await supabaseServer();
  const { data } = await sb.from("submission_rows").select("*").order("tgl_invoice", { ascending: false }).limit(5000);
  const rows = (data ?? []) as unknown as Row[];
  return (
    <AppShell>
      <div className="mb-3 flex items-center justify-between"><h1 className="text-xl font-semibold">Tabel Pengajuan</h1>
        <a href="#" className="text-sm text-brand">Ekspor Excel per batch tersedia di halaman batch</a></div>
      <PengajuanTable rows={rows} />
    </AppShell>
  );
}
