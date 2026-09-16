"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Item = Record<string, unknown>;
const value = (item: Item | undefined, key: string) => item?.[key] == null ? "" : String(item[key]);
const nameOf = (raw: unknown) => raw && typeof raw === "object" && "name" in raw ? String((raw as { name: string }).name) : "";
const statusText: Record<string, string> = { QUEUED: "Kuyrukta", IN_PROGRESS: "Üretimde", COMPLETED: "Tamamlandı", CANCELLED: "İptal" };

export default function ProductionPage() {
  const [jobs, setJobs] = useState<Item[]>([]); const [products, setProducts] = useState<Item[]>([]); const [orders, setOrders] = useState<Item[]>([]); const [factories, setFactories] = useState<Item[]>([]);
  const [form, setForm] = useState({ title: "", quantity: "", factoryId: "", factoryName: "", productId: "", orderId: "", costPerUnit: "" });
  const [show, setShow] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function load() {
    const [jobsRes, productsRes, ordersRes, factoriesRes] = await Promise.all([fetch("/api/modules/production"), fetch("/api/modules/products"), fetch("/api/orders"), fetch("/api/modules/factories")]);
    if (jobsRes.ok) setJobs(await jobsRes.json()); if (productsRes.ok) setProducts(await productsRes.json()); if (ordersRes.ok) setOrders(await ordersRes.json()); if (factoriesRes.ok) setFactories(await factoriesRes.json());
  }
  useEffect(() => { void load(); }, []);
  const selectedProduct = products.find((item) => value(item, "id") === form.productId);
  const recipe = useMemo(() => Array.isArray(selectedProduct?.components) ? selectedProduct.components as Item[] : [], [selectedProduct]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const factory = factories.find((item) => value(item, "id") === form.factoryId);
    const response = await fetch("/api/operations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create-job", ...form, factoryName: nameOf(factory) || form.factoryName }) });
    const body = await response.json();
    if (!response.ok) { setError(body.error ?? "Üretim işi oluşturulamadı."); return; }
    setMessage(body.ready === false ? "İş oluşturuldu. Eksik malzeme var — detaylar iş kartında." : "Üretim işi oluşturuldu.");
    setShow(false); setForm({ title: "", quantity: "", factoryId: "", factoryName: "", productId: "", orderId: "", costPerUnit: "" }); await load();
  }
  return <div className="min-h-screen px-6 py-6 lg:px-10"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow">ÜRETİM · İŞLER</div><h1 className="mt-2 text-3xl font-semibold">Üretim emirleri</h1><p className="mt-2 max-w-2xl text-sm text-muted">Siparişten üretim işi açın. Reçete varsa malzeme ihtiyacı ve maliyet anlık hesaplanır, fiyat değişince eski işin maliyeti değişmez.</p></div><button onClick={() => setShow(!show)} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-ink">{show ? "Kapat" : "Üretim işi"}</button></div>
    {message && <div className="mt-5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">{message}</div>}
    {error && <div className="mt-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
    {show && <form onSubmit={submit} className="card mt-6 grid gap-4 p-5 sm:grid-cols-2">
      <input required placeholder="İş adı" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <input required type="number" min="1" placeholder="Miktar" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <select value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm"><option value="">Ürün (reçete)</option>{products.map((item) => <option key={value(item, "id")} value={value(item, "id")}>{value(item, "name")}</option>)}</select>
      <select value={form.orderId} onChange={(event) => setForm({ ...form, orderId: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm"><option value="">Sipariş bağlantısı</option>{orders.map((item) => <option key={value(item, "id")} value={value(item, "id")}>{value(item, "orderNo")}</option>)}</select>
      <select value={form.factoryId} onChange={(event) => setForm({ ...form, factoryId: event.target.value, factoryName: nameOf(factories.find((item) => value(item, "id") === event.target.value)) })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm"><option value="">Fabrika</option>{factories.map((item) => <option key={value(item, "id")} value={value(item, "id")}>{value(item, "name")}</option>)}</select>
      <input type="number" min="0" step="0.01" placeholder="Birim fason maliyeti" value={form.costPerUnit} onChange={(event) => setForm({ ...form, costPerUnit: event.target.value })} className="rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      {recipe.length > 0 && <div className="sm:col-span-2 rounded-lg border border-line p-3 text-xs text-muted">{recipe.map((row) => `${nameOf(row.material) || value(row, "materialId")} × ${Number(form.quantity || 0) * Number(row.quantity || 0)}`).join(" · ")}</div>}
      <button className="sm:col-span-2 rounded-lg bg-accent p-3 text-sm font-bold text-ink">İşi oluştur</button>
    </form>}
    <section className="card mt-6 overflow-hidden"><div className="border-b border-line px-5 py-4 text-sm font-medium">{jobs.length} üretim işi</div>
      <div className="divide-y divide-line">{jobs.map((item) => <div className="px-5 py-4" key={value(item, "id")}><div className="flex flex-wrap justify-between gap-3"><div><div className="text-sm font-medium">{value(item, "jobNo")} · {value(item, "title")}</div><div className="mt-1 text-xs text-muted">{value(item, "factoryName") || "Fabrika yok"} · {value(item, "quantity")} adet</div>{value(item, "missingNotes") && <div className="mt-2 text-xs text-danger">{value(item, "missingNotes")}</div>}</div><span className="rounded-full border border-accent/30 px-3 py-1 text-xs text-accent">{statusText[value(item, "status")] ?? value(item, "status")}</span></div></div>)}</div>
      {jobs.length === 0 && <div className="p-10 text-center text-sm text-muted">Henüz üretim işi yok.</div>}
    </section>
  </div></div>;
}
