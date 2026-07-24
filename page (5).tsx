"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/Sidebar";
import { Button, Card, Input } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function NewBatch() {
  const [name, setName] = useState(""); const [entity, setEntity] = useState("GNU"); const [date, setDate] = useState("");
  const router = useRouter(); const sb = supabaseBrowser();
  async function create(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await sb.auth.getUser();
    const { data, error } = await sb.from("batches").insert({ name, entity_code: entity, submission_date: date || null, status: "DRAFT", created_by: user?.id }).select("id").single();
    if (!error && data) router.push(`/batches/${data.id}`);
  }
  return (
    <AppShell>
      <h1 className="mb-4 text-xl font-semibold">Batch Baru</h1>
      <Card className="max-w-lg">
        <form onSubmit={create} className="flex flex-col gap-3">
          <label className="text-sm">Nama batch<Input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label className="text-sm">Entitas
            <select className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm" value={entity} onChange={(e) => setEntity(e.target.value)}>
              {["GNU","KNU","GDN","SGP","TSK"].map((o) => <option key={o}>{o}</option>)}
            </select></label>
          <label className="text-sm">Tanggal pengajuan<Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <Button type="submit">Buat & Lanjut Upload</Button>
        </form>
      </Card>
    </AppShell>
  );
}
