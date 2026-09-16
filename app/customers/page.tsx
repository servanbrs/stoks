"use client";

import { FormEvent, useEffect, useState } from "react";

type Item = Record<string, unknown>;
const value = (item: Item | undefined, key: string) => item?.[key] == null ? "" : String(item[key]);
const nameOf = (raw: unknown) => raw && typeof raw === "object" && "name" in raw ? String((raw as { name: string }).name) : String(raw ?? "—");

export default function CustomersPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({ name: "", contact: "", phone: "", address: "", currency: "TRY", notes: "" });
  const [show, setShow] = useState(false); const [query, setQuery] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function load() { const response = await fetch("/api/modules/customers"); const body = await response.json(); if (response.ok) setItems(body); else setError(body.error ?? "Müşteriler alınamadı."); }
  useEffect(() => { void load(); }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/modules/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const body = await response.json();
    if (!response.ok) { setError(body.error ?? "Müşteri eklenemedi."); return; }
    setMessage("Müşteri kaydedildi."); setForm({ name: "", contact: "", phone: "", address: "", currency: "TRY", notes: "" }); setShow(false); await load();
  }
  const visible = items.filter((item) => !query || JSON.stringify(item).toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")));
  return <div className="min-h-screen px-6 py-6 lg:px-10"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow">CARİ · MÜŞTERİLER</div><h1 className="mt-2 text-3xl font-semibold">Müşteriler</h1><p className="mt-2 text-sm text-muted">Cari kart, iletişim ve sipariş geçmişi.</p></div><button onClick={() => setShow(!show)} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-ink">{show ? "Kapat" : "Müşteri ekle"}</button></div>
    {message && <div className="mt-5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">{message}</div>}
    {error && <div className="mt-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
    {show && <form onSubmit={submit} className="card mt-6 grid gap-4 p-5 sm:grid-cols-2">
      <input required placeholder="Müşteri adı" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <input placeholder="Yetkili" value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <input placeholder="Telefon" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm"><option>TRY</option><option>USD</option></select>
      <input placeholder="Adres" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="sm:col-span-2 rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <button className="sm:col-span-2 rounded-lg bg-accent p-3 text-sm font-bold text-ink">Kaydet</button>
    </form>}
    <section className="card mt-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4"><span className="text-sm font-medium">{visible.length} müşteri</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-lg border border-line bg-[#0d1219] p-2.5 text-sm sm:w-72" placeholder="Ara..." /></div>
      <div className="divide-y divide-line">{visible.map((item) => <div className="flex flex-wrap justify-between gap-3 px-5 py-4" key={value(item, "id")}><div><div className="text-sm font-medium">{value(item, "name")}</div><div className="mt-1 text-xs text-muted">{value(item, "contact") || "—"} · {value(item, "phone") || "—"} · {value(item, "currency")}</div></div><div className="text-xs text-muted">{Array.isArray(item.orders) ? `${item.orders.length} sipariş` : nameOf(item.orders)}</div></div>)}</div>
      {visible.length === 0 && <div className="p-10 text-center text-sm text-muted">Henüz müşteri yok.</div>}
    </section>
  </div></div>;
}
