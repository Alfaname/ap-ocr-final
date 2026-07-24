import Link from "next/link";
export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-bold text-brand">AP OCR — Pengajuan Account Payable</h1>
      <p className="max-w-xl text-neutral-600">Ubah foto/PDF invoice, nota, dan struk menjadi tabel pengajuan Account Payable dengan review manusia dan approval. Seluruh data supplier, rekening, dan invoice dilindungi login.</p>
      <div className="flex gap-3">
        <Link href="/login" className="rounded-md bg-brand px-4 py-2 text-white">Masuk</Link>
        <Link href="/login?demo=1" className="rounded-md border border-neutral-300 px-4 py-2">Mode Demo (data tersamar)</Link>
      </div>
    </div>
  );
}
