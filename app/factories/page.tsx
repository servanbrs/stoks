"use client";

import { FormEvent, useEffect, useState } from "react";

type Item = Record<string, unknown>;
const value = (item: Item | undefined, key: string) => item?.[key] == null ? "" : String(item[key]);

export default function FactoriesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({ name: "", contact: "", phone: "", address: "", notes: "" });
  const [show, setShow] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function load() { const response = await fetch("/api/modules/factories"); const body = await response.json(); if (response.ok) setItems(body); else setError(body.error ?? "Fabrikalar alınamadı."); }
  useEffect(() => { void load(); }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/modules/factories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const body = await response.json();
    if (!response.ok) { setError(body.error ?? "Fabrika eklenemedi."); return; }
    setMessage("Fabrika kaydedildi."); setForm({ name: "", contact: "", phone: "", address: "", notes: "" }); setShow(false); await load();
  }
  return <div className="min-h-screen px-6 py-6 lg:px-10"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow">ÜRETİM · FABRİKALAR</div><h1 className="mt-2 text-3xl font-semibold">Fason fabrikalar</h1><p className="mt-2 text-sm text-muted">Fabrika kartı, yetkili ve iletişim bilgileri.</p></div><button onClick={() => setShow(!show)} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-ink">{show ? "Kapat" : "Fabrika ekle"}</button></div>
    {message && <div className="mt-5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">{message}</div>}
    {error && <div className="mt-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
    {show && <form onSubmit={submit} className="card mt-6 grid gap-4 p-5 sm:grid-cols-2">
      <input required placeholder="Fabrika adı" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <input placeholder="Yetkili" value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <input placeholder="Telefon" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <input placeholder="Adres" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <textarea placeholder="Notlar" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="sm:col-span-2 rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <button className="sm:col-span-2 rounded-lg bg-accent p-3 text-sm font-bold text-ink">Kaydet</button>
    </form>}
    <section className="card mt-6 overflow-hidden"><div className="border-b border-line px-5 py-4 text-sm font-medium">{items.length} fabrika</div>
      <div className="divide-y divide-line">{items.map((item) => <div className="px-5 py-4" key={value(item, "id")}><div className="text-sm font-medium">{value(item, "name")}</div><div className="mt-1 text-xs text-muted">{value(item, "contact") || "—"} · {value(item, "phone") || "—"} · {value(item, "address") || "—"}</div></div>)}</div>
      {items.length === 0 && <div className="p-10 text-center text-sm text-muted">Henüz fabrika yok.</div>}
    </section>
  </div></div>;
}
