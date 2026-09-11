"use client";

import { useEffect, useState } from "react";

type RequestItem = { id: string; requestNo: string; material: string; quantity: number; unit: string; status: string; createdAt: string };
const labels: Record<string, string> = { REQUESTED: "Talep edildi", APPROVED: "Onaylandı", ORDERED: "Sipariş verildi", IN_TRANSIT: "Yolda", RECEIVED: "Teslim alındı", CANCELLED: "İptal" };

export default function RequestsPage() {
  const [items, setItems] = useState<RequestItem[]>([]);
  useEffect(() => { const saved = JSON.parse(localStorage.getItem("stoks_material_requests") ?? "[]") as RequestItem[]; setItems(saved); }, []);
  return <div className="min-h-screen px-6 py-6 lg:px-10"><div className="mx-auto max-w-6xl"><div className="eyebrow">STOK · TALEPLER</div><h1 className="mt-2 text-3xl font-semibold">Malzeme talepleri</h1><p className="mt-2 text-sm text-muted">Asistan veya ekip tarafından açılan eksik malzeme taleplerini ve durumlarını takip edin.</p><div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="card p-5"><div className="eyebrow">Açık talepler</div><div className="mt-2 text-3xl text-accent">{items.filter((item) => item.status !== "RECEIVED" && item.status !== "CANCELLED").length}</div></div><div className="card p-5"><div className="eyebrow">Onay bekleyen</div><div className="mt-2 text-3xl text-danger">{items.filter((item) => item.status === "REQUESTED").length}</div></div><div className="card p-5"><div className="eyebrow">Kanıt gereken</div><div className="mt-2 text-3xl text-success">3</div></div></div><div className="card mt-6 overflow-hidden"><div className="border-b border-line px-5 py-4 text-sm font-medium">Talep listesi</div><div className="divide-y divide-line">{items.map((item) => <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4" key={item.id}><div><div className="text-sm font-medium">{item.material} <span className="ml-2 text-xs text-muted">{item.requestNo}</span></div><div className="mt-1 text-xs text-muted">{item.quantity} {item.unit} · {new Date(item.createdAt).toLocaleString("tr-TR")}</div></div><span className={`rounded-full px-3 py-1 text-xs ${item.status === "REQUESTED" ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>{labels[item.status] ?? item.status}</span></div>)}</div></div></div></div>;
}
