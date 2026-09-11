"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type RequestItem = { id: string; requestNo: string; material: string; quantity: number; unit: string; status: string; createdAt: string };
type PaymentItem = { id: string; partyName: string; amount: number; currency: string; direction: "PAYMENT" | "COLLECTION"; createdAt: string };
type DeliveryItem = { id: string; partyName: string; quantity: number; product: string; status: string; createdAt: string };

const aliases: Record<string, { name: string; unit: string }> = { kutu: { name: "Kutu", unit: "adet" }, valf: { name: "Valf", unit: "adet" }, şişe: { name: "Şişe", unit: "adet" }, sise: { name: "Şişe", unit: "adet" }, esans: { name: "Esans", unit: "ml" }, kapak: { name: "Kapak", unit: "adet" } };
const cleanName = (value: string) => value.replace(/[&'’]?(e|a|ye|ya)$/, "").trim().replace(/\s+/g, " ");
const amountValue = (value: string) => Number(value.replaceAll(".", ""));

export function Assistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ title: string; detail: string; href: string } | null>(null);
  const [error, setError] = useState("");

  function createAction(event: FormEvent) {
    event.preventDefault();
    const normalized = text.toLocaleLowerCase("tr-TR").trim();
    const now = new Date().toISOString();

    const payment = normalized.match(/(?:admin\s+)?([\d.]+)\s*(dolar|usd|tl|lira|₺|\$)\s+(?:ödeme|öde|ödendi)(?:\s+(?:şu\s+kişiye\s+)?)?(.+)/i) ?? normalized.match(/(.+?)[’']?(?:e|a|ye|ya)\s+([\d.]+)\s*(dolar|usd|tl|lira|₺|\$)\s+(?:ödeme|öde|ödendi)/i);
    if (payment) {
      const firstIsAmount = /^[\d.]+$/.test(payment[1]);
      const amount = amountValue(firstIsAmount ? payment[1] : payment[2]);
      const rawCurrency = firstIsAmount ? payment[2] : payment[3];
      const currency = rawCurrency.toLocaleLowerCase("tr-TR").includes("dolar") || rawCurrency.toLowerCase() === "usd" || rawCurrency === "$" ? "USD" : "TRY";
      const partyName = cleanName(firstIsAmount ? payment[3] : payment[1]);
      const item: PaymentItem = { id: crypto.randomUUID(), partyName, amount, currency, direction: "PAYMENT", createdAt: now };
      const existing = JSON.parse(localStorage.getItem("stoks_payments") ?? "[]") as PaymentItem[];
      localStorage.setItem("stoks_payments", JSON.stringify([item, ...existing]));
      setResult({ title: "Cari işlemi oluşturuldu", detail: `${partyName} · ${amount.toLocaleString("tr-TR")} ${currency} ödeme`, href: `/finance?party=${encodeURIComponent(partyName)}` }); setText(""); setError(""); return;
    }

    const delivery = normalized.match(/(.+?)[’']?(?:e|a|ye|ya)\s+([\d.]+)\s+(.+?)\s+(?:ürün\s+)?teslim(?:\s+edildi|edilecek|et)?/i);
    if (delivery) {
      const partyName = cleanName(delivery[1]);
      const quantity = amountValue(delivery[2]);
      const product = delivery[3].replace(/\s+teslim.*$/, "").trim();
      const item: DeliveryItem = { id: crypto.randomUUID(), partyName, quantity, product, status: "PENDING_EVIDENCE", createdAt: now };
      const existing = JSON.parse(localStorage.getItem("stoks_delivery_tasks") ?? "[]") as DeliveryItem[];
      localStorage.setItem("stoks_delivery_tasks", JSON.stringify([item, ...existing]));
      setResult({ title: "Teslimat işi oluşturuldu", detail: `${partyName} · ${quantity} adet ${product}`, href: `/deliveries?party=${encodeURIComponent(partyName)}` }); setText(""); setError(""); return;
    }

    const missing = normalized.match(/([\d.]+)\s*(kutu|valf|şişe|sise|esans|kapak)/i);
    if (missing) {
      const material = aliases[missing[2].toLocaleLowerCase("tr-TR")];
      const item: RequestItem = { id: crypto.randomUUID(), requestNo: `REQ-${Date.now().toString().slice(-5)}`, material: material.name, quantity: amountValue(missing[1]), unit: material.unit, status: "REQUESTED", createdAt: now };
      const existing = JSON.parse(localStorage.getItem("stoks_material_requests") ?? "[]") as RequestItem[];
      localStorage.setItem("stoks_material_requests", JSON.stringify([item, ...existing]));
      setResult({ title: "Malzeme talebi oluşturuldu", detail: `${item.quantity} ${item.unit} ${item.material} · Talep edildi`, href: "/requests" }); setText(""); setError(""); return;
    }
    setError("Örnek: 300 kutu eksik · Ahmet'e 3000 dolar ödeme · Mehmet'e 500 ürün teslim");
  }

  return <div className="fixed bottom-5 right-5 z-50">{open && <div className="mb-3 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-accent/30 bg-[#11161e] shadow-2xl"><div className="flex items-center justify-between border-b border-line bg-[#171e29] px-4 py-3"><div><div className="text-sm font-semibold">Stoks asistanı</div><div className="text-[11px] text-muted">Cari, teslimat ve stok işlemleri</div></div><button onClick={() => setOpen(false)} className="text-lg text-muted hover:text-white" aria-label="Asistanı kapat">×</button></div><div className="p-4"><p className="mt-0 text-xs leading-5 text-muted">Ne yapmak istediğini yaz; cari açalım, ödeme ekleyelim, teslimat işi oluşturalım veya stok talebi açalım.</p><div className="mb-3 flex flex-wrap gap-2">{["300 kutu eksik", "Ahmet'e 3000 dolar ödeme", "Mehmet'e 500 ürün teslim"].map((suggestion) => <button key={suggestion} onClick={() => setText(suggestion)} className="rounded-full border border-line px-2.5 py-1 text-[10px] text-muted hover:border-accent hover:text-accent">{suggestion}</button>)}</div><form onSubmit={createAction}><input value={text} onChange={(event) => setText(event.target.value)} className="w-full rounded-lg border border-line bg-[#0d1219] px-3 py-2.5 text-sm outline-none focus:border-accent" placeholder="Örn. Ahmet'e 3000 dolar ödeme" /><button className="mt-2 w-full rounded-lg bg-accent px-3 py-2.5 text-xs font-bold text-ink" type="submit">İşlemi yap</button></form>{error && <p className="mb-0 mt-3 text-xs text-danger">{error}</p>}{result && <div className="mt-3 rounded-lg border border-success/30 bg-success/5 p-3"><div className="text-xs font-medium text-success">{result.title}</div><div className="mt-1 text-xs text-muted">{result.detail}</div><div className="mt-2 flex gap-3 text-xs"><Link href={result.href} className="text-accent hover:underline">Detayı aç →</Link><button onClick={() => router.push(result.href)} className="text-muted hover:text-white">Şimdi git</button></div></div>}</div></div>}<button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full border border-accent/40 bg-accent px-4 py-3 text-xs font-bold text-ink shadow-lg shadow-accent/10 transition hover:bg-[#d9ba7b]" aria-label="Stoks asistanını aç"><span className="text-base">✦</span> Asistan</button></div>;
}
