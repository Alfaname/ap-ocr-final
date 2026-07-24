// Masking nomor rekening — hanya role berwenang (ADMIN/APPROVER) lihat penuh (brief §L, §AB).
export function maskAccount(no: string | null | undefined): string {
  if (!no) return "";
  const s = String(no).replace(/\s/g, "");
  if (s.length <= 4) return "•".repeat(s.length);
  return "•".repeat(Math.max(0, s.length - 4)) + s.slice(-4);
}
export function canSeeFullAccount(roles: string[]): boolean {
  return roles.includes("ADMIN") || roles.includes("APPROVER");
}
