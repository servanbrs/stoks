"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type RequestItem = { id: string; requestNo: string; material: string; quantity: number; unit: string; status: string; createdAt: string };

const aliases: Record<string, { name: string; unit: string }> = {
  kutu: { name: "Kutu", unit: "adet" },
  valf: { name: "Valf", unit: "adet" },
  şişe: { name: "Şişe", unit: "adet" },
  sise: { name: "Şişe", unit: "adet" },
  esans: { name: "Esans", unit: "ml" },
  kapak: { name: "Kapak", unit: "adet" },
};

export function Assistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [created, setCreated] = useState<RequestItem | null>(null);
  const [error, setError] = useState("");

  function createRequest(event: FormEvent) {
    event.preventDefault();
    const match = text.toLocaleLowerCase("tr-TR").match(/([\d.]+)\s*(kutu|valf|şişe|sise|esans|kapak)/i);
    if (!match) { setError("Örnek: 300 kutu eksik veya 500 ml esans eksik"); return; }
    const material = aliases[match[2].toLocaleLowerCase("tr-TR")];
    const item: RequestItem = { id: crypto.randomUUID(), requestNo: `REQ-${Date.now().toString().slice(-5)}`, material: material.name, quantity: Number(match[1].replaceAll(".", "")), unit: material.unit, status: "REQUESTED", createdAt: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem("stoks_material_requests") ?? "[]") as RequestItem[];
    localStorage.setItem("stoks_material_requests", JSON.stringify([item, ...existing]));
    setCreated(item); setText(""); setError("");
  }

  return <div className="fixed bottom-5 right-5 z-50">
    {open && <div className="mb-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-accent/30 bg-[#11161e] shadow-2xl">
      <div className="flex items-center justify-between border-b border-line bg-[#171e29] px-4 py-3"><div><div className="text-sm font-semibold">Stoks asistanı</div><div className="text-[11px] text-muted">Eksik malzeme ve operasyon desteği</div></div><button onClick={() => setOpen(false)} className="text-lg text-muted hover:text-white" aria-label="Asistanı kapat">×</button></div>
      <div className="p-4"><p className="mt-0 text-xs leading-5 text-muted">Eksik olanı yaz; talep oluşturalım ve ilgili ekrana yönlendirelim.</p><div className="mb-3 flex flex-wrap gap-2">{["300 kutu eksik", "500 valf eksik", "1000 ml esans eksik"].map((suggestion) => <button key={suggestion} onClick={() => setText(suggestion)} className="rounded-full border border-line px-2.5 py-1 text-[10px] text-muted hover:border-accent hover:text-accent">{suggestion}</button>)}</div><form onSubmit={createRequest}><input value={text} onChange={(event) => setText(event.target.value)} className="w-full rounded-lg border border-line bg-[#0d1219] px-3 py-2.5 text-sm outline-none focus:border-accent" placeholder="Örn. 300 kutu eksik" /><button className="mt-2 w-full rounded-lg bg-accent px-3 py-2.5 text-xs font-bold text-ink" type="submit">Talep oluştur</button></form>{error && <p className="mb-0 mt-3 text-xs text-danger">{error}</p>}{created && <div className="mt-3 rounded-lg border border-success/30 bg-success/5 p-3"><div className="text-xs font-medium text-success">{created.requestNo} oluşturuldu</div><div className="mt-1 text-xs text-muted">{created.quantity} {created.unit} {created.material} · Talep edildi</div><div className="mt-2 flex gap-3 text-xs"><Link href="/requests" className="text-accent hover:underline">Taleplerimi gör →</Link><button onClick={() => router.push("/materials")} className="text-muted hover:text-white">Malzemeye git</button></div></div>}</div>
    </div>}
    <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full border border-accent/40 bg-accent px-4 py-3 text-xs font-bold text-ink shadow-lg shadow-accent/10 transition hover:bg-[#d9ba7b]" aria-label="Stoks asistanını aç"><span className="text-base">✦</span> Asistan</button>
  </div>;
}
