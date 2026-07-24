"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button, Card, Input } from "@/components/ui";
export default function Login() {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false); const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErr("");
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) setErr(error.message); else router.push("/dashboard");
  }
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-4 text-lg font-semibold">Masuk</h1>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Kata sandi" value={pw} onChange={(e) => setPw(e.target.value)} required />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Button type="submit" disabled={loading}>{loading ? "Memproses…" : "Masuk"}</Button>
        </form>
      </Card>
    </div>
  );
}
