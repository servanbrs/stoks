"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DashboardData } from "@/lib/dashboard";

const money = (value: number, currency: "TRY" | "USD") =>
  value.toLocaleString("tr-TR", { style: "currency", currency, maximumFractionDigits: 0 });

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    void fetch("/api/dashboard").then(async (response) => {
      const body = await response.json();
      if (!response.ok) setError(body.error ?? "Dashboard alınamadı.");
      else setData(body);
    });
  }, []);
  if (error) return <div className="min-h-screen px-6 py-6 lg:px-10"><div className="card p-6 text-sm text-danger">{error}</div></div>;
  if (!data) return <div className="min-h-screen px-6 py-6 lg:px-10 text-sm text-muted">Operasyon özeti yükleniyor...</div>;
  const cards = [
    ["Toplam sipariş", String(data.totals.orders), "/orders"],
    ["Üretimdeki işler", String(data.totals.production), "/production"],
    ["Bekleyen teslimat", String(data.totals.shipments), "/shipments"],
    ["Kritik stok", String(data.totals.critical), "/materials"],
  ] as const;
  return (
    <div className="min-h-screen px-6 py-6 lg:px-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">OPERASYON MERKEZİ</div>
          <h1 className="m-0 text-3xl font-semibold tracking-tight">Genel bakış</h1>
          <p className="mt-2 text-sm text-muted">{data.demo ? "Yerel demo verisiyle çalışıyor." : "Canlı stok, sipariş ve üretim özeti."}</p>
        </div>
        <div className="card px-5 py-4">
          <div className="eyebrow">USD / TRY</div>
          <div className="mt-1 text-2xl font-semibold text-accent">₺{data.usdTry.rate.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="mt-1 text-[11px] text-muted">{data.usdTry.source} · {new Date(data.usdTry.capturedAt).toLocaleString("tr-TR")}</div>
        </div>
      </header>
      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, href]) => (
          <Link className="card p-5 hover:border-accent/40" href={href} key={label}>
            <div className="eyebrow">{label}</div>
            <div className="mt-3 text-3xl font-semibold text-accent">{value}</div>
          </Link>
        ))}
      </section>
      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5"><div className="eyebrow">Malzeme miktarı</div><div className="mt-3 text-2xl font-semibold">{data.stock.materialQty.toLocaleString("tr-TR")}</div></div>
        <div className="card p-5"><div className="eyebrow">Malzeme değeri</div><div className="mt-3 text-2xl font-semibold">{money(data.stock.materialValueTry, "TRY")}</div></div>
        <div className="card p-5"><div className="eyebrow">Bitmiş ürün değeri</div><div className="mt-3 text-2xl font-semibold">{money(data.stock.productValueTry, "TRY")}</div></div>
        <div className="card p-5"><div className="eyebrow">Toplam stok / USD</div><div className="mt-3 text-2xl font-semibold text-accent">{money(data.stock.totalTry, "TRY")}</div><div className="mt-1 text-xs text-muted">{money(data.stock.totalUsd, "USD")}</div></div>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="card overflow-hidden">
          <div className="border-b border-line px-5 py-4"><div className="eyebrow">Acil işler</div><h2 className="mt-1 text-xl font-semibold">Kritikler ve bekleyenler</h2></div>
          {data.urgents.length === 0 ? <div className="p-8 text-sm text-muted">Şu an bekleyen acil iş yok.</div> : (
            <div className="divide-y divide-line">
              {data.urgents.map((item) => (
                <Link className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#171e29]" href={item.href} key={`${item.href}-${item.label}`}>
                  <div>
                    <div className={`text-sm font-medium ${item.tone === "danger" ? "text-danger" : ""}`}>{item.label}</div>
                    <div className="mt-1 text-xs text-muted">{item.detail}</div>
                  </div>
                  <span className="text-xs text-accent">Aç</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="card overflow-hidden">
          <div className="border-b border-line px-5 py-4"><div className="eyebrow">Son hareketler</div><h2 className="mt-1 text-xl font-semibold">Aktivite</h2></div>
          {data.activity.length === 0 ? <div className="p-8 text-sm text-muted">Henüz hareket yok.</div> : (
            <div className="divide-y divide-line">
              {data.activity.map((item) => (
                <div className="px-5 py-4" key={item.id}>
                  <div className="text-sm">{item.title}</div>
                  <div className="mt-1 text-xs text-muted">{item.at ? new Date(item.at).toLocaleString("tr-TR") : ""}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
