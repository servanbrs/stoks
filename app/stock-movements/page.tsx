"use client";

import { FormEvent, useEffect, useState } from "react";

type Item = Record<string, unknown>;
const value = (item: Item | undefined, key: string) => item?.[key] == null ? "" : String(item[key]);
const nameOf = (raw: unknown) => raw && typeof raw === "object" && "name" in raw ? String((raw as { name: string }).name) : String(raw ?? "—");

export default function StockMovementsPage() {
  const [items, setItems] = useState<Item[]>([]); const [warehouses, setWarehouses] = useState<Item[]>([]); const [materials, setMaterials] = useState<Item[]>([]);
  const [form, setForm] = useState({ warehouseId: "", materialId: "", quantity: "", unitCost: "", description: "", locationCode: "", shelfCode: "" });
  const [show, setShow] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function load() {
    const [moveRes, warehouseRes, materialRes] = await Promise.all([fetch("/api/modules/stock-movements"), fetch("/api/modules/warehouses"), fetch("/api/modules/materials")]);
    if (moveRes.ok) setItems(await moveRes.json()); if (warehouseRes.ok) setWarehouses(await warehouseRes.json()); if (materialRes.ok) setMaterials(await materialRes.json());
  }
  useEffect(() => { void load(); }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/modules/stock-movements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const body = await response.json();
    if (!response.ok) { setError(body.error ?? "Hareket kaydedilemedi."); return; }
    setMessage("Stok hareketi yazıldı. Bakiye doğrudan değil, hareketle değişti."); setShow(false); setForm({ warehouseId: "", materialId: "", quantity: "", unitCost: "", description: "", locationCode: "", shelfCode: "" }); await load();
  }
  return <div className="min-h-screen px-6 py-6 lg:px-10"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow">STOK · HAREKETLER</div><h1 className="mt-2 text-3xl font-semibold">Stok hareketleri</h1><p className="mt-2 text-sm text-muted">Giriş için artı, çıkış için eksi miktar yazın. Her değişiklik hareket kaydı üretir.</p></div><button onClick={() => setShow(!show)} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-ink">{show ? "Kapat" : "Hareket ekle"}</button></div>
    {message && <div className="mt-5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">{message}</div>}
    {error && <div className="mt-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
    {show && <form onSubmit={submit} className="card mt-6 grid gap-4 p-5 sm:grid-cols-2">
      <select required value={form.warehouseId} onChange={(event) => setForm({ ...form, warehouseId: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm"><option value="">Depo</option>{warehouses.map((item) => <option key={value(item, "id")} value={value(item, "id")}>{value(item, "name")}</option>)}</select>
      <select required value={form.materialId} onChange={(event) => setForm({ ...form, materialId: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm"><option value="">Malzeme</option>{materials.map((item) => <option key={value(item, "id")} value={value(item, "id")}>{value(item, "name")}</option>)}</select>
      <input required type="number" step="0.001" placeholder="Miktar (+ giriş / − çıkış)" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <input type="number" min="0" step="0.01" placeholder="Birim maliyet" value={form.unitCost} onChange={(event) => setForm({ ...form, unitCost: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <input placeholder="Açıklama" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="sm:col-span-2 rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <button className="sm:col-span-2 rounded-lg bg-accent p-3 text-sm font-bold text-ink">Hareketi kaydet</button>
    </form>}
    <section className="card mt-6 overflow-hidden"><div className="border-b border-line px-5 py-4 text-sm font-medium">{items.length} hareket</div>
      <div className="divide-y divide-line">{items.map((item) => <div className="flex flex-wrap justify-between gap-3 px-5 py-4" key={value(item, "id")}><div><div className="text-sm font-medium">{value(item, "type")} · {nameOf(item.material)}</div><div className="mt-1 text-xs text-muted">{value(item, "description") || "—"} · {nameOf(item.user)} · {value(item, "createdAt") ? new Date(value(item, "createdAt")).toLocaleString("tr-TR") : ""}</div></div><div className="text-sm text-accent">{value(item, "quantity")}</div></div>)}</div>
      {items.length === 0 && <div className="p-10 text-center text-sm text-muted">Henüz stok hareketi yok.</div>}
    </section>
  </div></div>;
}
