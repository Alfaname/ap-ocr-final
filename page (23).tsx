import { AppShell } from "@/components/Sidebar";
import { Card } from "@/components/ui";
import { currentUserRoles } from "@/server/guards";
export default async function Settings() {
  const { userId, roles } = await currentUserRoles();
  return (
    <AppShell>
      <h1 className="mb-4 text-xl font-semibold">Pengaturan</h1>
      <Card><p className="text-sm">User ID: <span className="font-mono">{userId}</span></p><p className="mt-1 text-sm">Role: {roles.join(", ") || "-"}</p>
        <p className="mt-3 text-xs text-neutral-500">Toleransi validasi, model OCR (ANTHROPIC_MODEL), dan manajemen user diatur via environment & Supabase. Hanya ADMIN yang dapat mengubah master, user, dan integrasi.</p></Card>
    </AppShell>
  );
}
