import { AppShell } from "@/components/Sidebar";
import { Card, Button } from "@/components/ui";
export default async function Integrations() {
  return (
    <AppShell>
      <h1 className="mb-4 text-xl font-semibold">Integrasi</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><h2 className="text-sm font-semibold">Google Drive</h2><p className="mt-1 text-sm text-neutral-500">Hubungkan untuk memilih folder/file invoice. Scope minimum (readonly). Folder hanya menjadi hint konteks.</p><a href="/api/drive/auth"><Button className="mt-3" variant="outline">Hubungkan Drive</Button></a></Card>
        <Card><h2 className="text-sm font-semibold">Google Sheets</h2><p className="mt-1 text-sm text-neutral-500">Append baris APPROVED ke tab GNU/KNU (append-only, cek duplikat, tidak menimpa). Mode: Preview, Append, Export XLSX.</p><a href="/api/sheets/auth"><Button className="mt-3" variant="outline">Hubungkan Sheets</Button></a></Card>
        <Card><h2 className="text-sm font-semibold">Impor Master</h2><p className="mt-1 text-sm text-neutral-500">Impor Master Supplier & SKU dari XLSX/CSV/Google Sheets dengan preview & validasi. Jalankan <code>npm run import:master</code>.</p></Card>
      </div>
    </AppShell>
  );
}
