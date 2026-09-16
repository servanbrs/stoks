"use client";

import { useEffect, useState } from "react";

type Item = Record<string, unknown>;
const value = (item: Item | undefined, key: string) => item?.[key] == null ? "" : String(item[key]);
const nameOf = (raw: unknown) => raw && typeof raw === "object" && "name" in raw ? String((raw as { name: string }).name) : "";

export default function ActivityPage() {
  const [items, setItems] = useState<Item[]>([]); const [error, setError] = useState("");
  useEffect(() => { void fetch("/api/modules/activity").then(async (response) => { const body = await response.json(); if (response.ok) setItems(body); else setError(body.error ?? "Aktivite alınamadı."); }); }, []);
  return <div className="min-h-screen px-6 py-6 lg:px-10"><div className="mx-auto max-w-4xl">
    <div className="eyebrow">SİSTEM · AKTİVİTE</div><h1 className="mt-2 text-3xl font-semibold">İşler / operasyon geçmişi</h1><p className="mt-2 text-sm text-muted">Kim ne yaptı — silinmeyen denetim izi.</p>
    {error && <div className="mt-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
    <section className="card mt-6 overflow-hidden">
      {items.length === 0 ? <div className="p-10 text-center text-sm text-muted">Henüz kayıt yok.</div> : (
        <div className="divide-y divide-line">{items.map((item) => <div className="px-5 py-4" key={value(item, "id")}>
          <div className="text-sm font-medium">{nameOf(item.user) || "Sistem"} · {value(item, "action")} · {value(item, "entity")}</div>
          <div className="mt-1 text-xs text-muted">{value(item, "createdAt") ? new Date(value(item, "createdAt")).toLocaleString("tr-TR") : ""} · {value(item, "entityId")}</div>
        </div>)}</div>
      )}
    </section>
  </div></div>;
}
