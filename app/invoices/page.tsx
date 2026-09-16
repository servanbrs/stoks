"use client";

import { FormEvent, useEffect, useState } from "react";

type Item = Record<string, unknown>;
const value = (item: Item | undefined, key: string) => item?.[key] == null ? "" : String(item[key]);
const nameOf = (raw: unknown) => raw && typeof raw === "object" && "name" in raw ? String((raw as { name: string }).name) : String(raw ?? "—");

export default function InvoicesPage() {
  const [items, setItems] = useState<Item[]>([]); const [customers, setCustomers] = useState<Item[]>([]);
  const [form, setForm] = useState({ customerId: "", subtotal: "", tax: "0", total: "", currency: "TRY", notes: "" });
  const [show, setShow] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function load() {
    const [invoiceRes, customerRes] = await Promise.all([fetch("/api/modules/invoices"), fetch("/api/modules/customers")]);
    if (invoiceRes.ok) setItems(await invoiceRes.json()); if (customerRes.ok) setCustomers(await customerRes.json());
  }
  useEffect(() => { void load(); }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/modules/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, total: form.total || Number(form.subtotal || 0) + Number(form.tax || 0) }) });
    const body = await response.json();
    if (!response.ok) { setError(body.error ?? "Fatura eklenemedi."); return; }
    setMessage("Fatura kaydı oluşturuldu."); setShow(false); setForm({ customerId: "", subtotal: "", tax: "0", total: "", currency: "TRY", notes: "" }); await load();
  }
  return <div className="min-h-screen px-6 py-6 lg:px-10"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow">CARİ · FATURALAR</div><h1 className="mt-2 text-3xl font-semibold">İç fatura kayıtları</h1><p className="mt-2 text-sm text-muted">Resmi e-fatura değil; sipariş ve tahsilat takibi için iç kayıt.</p></div><button onClick={() => setShow(!show)} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-ink">{show ? "Kapat" : "Fatura kaydı"}</button></div>
    {message && <div className="mt-5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">{message}</div>}
    {error && <div className="mt-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
    {show && <form onSubmit={submit} className="card mt-6 grid gap-4 p-5 sm:grid-cols-2">
      <select required value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm"><option value="">Müşteri</option>{customers.map((item) => <option key={value(item, "id")} value={value(item, "id")}>{value(item, "name")}</option>)}</select>
      <select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm"><option>TRY</option><option>USD</option></select>
      <input required type="number" min="0.01" step="0.01" placeholder="Ara toplam" value={form.subtotal} onChange={(event) => setForm({ ...form, subtotal: event.target.value, total: String(Number(event.target.value || 0) + Number(form.tax || 0)) })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <input type="number" min="0" step="0.01" placeholder="Vergi (opsiyonel)" value={form.tax} onChange={(event) => setForm({ ...form, tax: event.target.value, total: String(Number(form.subtotal || 0) + Number(event.target.value || 0)) })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <button className="sm:col-span-2 rounded-lg bg-accent p-3 text-sm font-bold text-ink">Kaydet</button>
    </form>}
    <section className="card mt-6 overflow-hidden"><div className="border-b border-line px-5 py-4 text-sm font-medium">{items.length} kayıt</div>
      <div className="divide-y divide-line">{items.map((item) => <div className="flex flex-wrap justify-between gap-3 px-5 py-4" key={value(item, "id")}><div><div className="text-sm font-medium">{value(item, "invoiceNo")}</div><div className="mt-1 text-xs text-muted">{nameOf(item.customer)} · {value(item, "status")}</div></div><div className="text-sm text-accent">{Number(item.total ?? 0).toLocaleString("tr-TR")} {value(item, "currency")}</div></div>)}</div>
      {items.length === 0 && <div className="p-10 text-center text-sm text-muted">Henüz fatura kaydı yok.</div>}
    </section>
  </div></div>;
}
