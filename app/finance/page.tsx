"use client";

import { useEffect, useMemo, useState } from "react";

type Payment = { id: string; partyName: string; amount: number; currency: string; direction: "PAYMENT" | "COLLECTION"; createdAt: string };
const demo: Payment[] = [{ id: "demo-payment", partyName: "A Kozmetik", amount: 5000, currency: "USD", direction: "COLLECTION", createdAt: new Date().toISOString() }];

export default function FinancePage() {
  const [payments, setPayments] = useState<Payment[]>(demo);
  const [party, setParty] = useState<string | null>(null);
  useEffect(() => { const saved = JSON.parse(localStorage.getItem("stoks_payments") ?? "[]") as Payment[]; if (saved.length) setPayments([...saved, ...demo]); setParty(new URLSearchParams(window.location.search).get("party")); }, []);
  const filtered = useMemo(() => party ? payments.filter((item) => item.partyName.toLocaleLowerCase("tr-TR") === party.toLocaleLowerCase("tr-TR")) : payments, [party, payments]);
  const balance = filtered.reduce((total, item) => total + (item.direction === "PAYMENT" ? item.amount : -item.amount), 0);
  return <div className="min-h-screen px-6 py-6 lg:px-10"><div className="mx-auto max-w-6xl"><div className="eyebrow">CARİ VE KAYITLAR · FİNANS</div><h1 className="mt-2 text-3xl font-semibold">{party ? `${party} cari hesabı` : "Cari hesaplar"}</h1><p className="mt-2 text-sm text-muted">Ödemeler, tahsilatlar ve kişi bazlı bakiye geçmişi.</p><div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="card p-5"><div className="eyebrow">Seçili kişi</div><div className="mt-2 text-lg font-medium">{party ?? "Tüm cari hesaplar"}</div></div><div className="card p-5"><div className="eyebrow">Bakiye hareketi</div><div className={`mt-2 text-3xl ${balance > 0 ? "text-danger" : "text-success"}`}>{Math.abs(balance).toLocaleString("tr-TR")} USD</div></div><div className="card p-5"><div className="eyebrow">İşlem sayısı</div><div className="mt-2 text-3xl text-accent">{filtered.length}</div></div></div><div className="card mt-6 overflow-hidden"><div className="border-b border-line px-5 py-4 text-sm font-medium">Hareket geçmişi</div><div className="divide-y divide-line">{filtered.map((item) => <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4" key={item.id}><div><div className="text-sm font-medium">{item.partyName}</div><div className="mt-1 text-xs text-muted">{new Date(item.createdAt).toLocaleString("tr-TR")}</div></div><div className={item.direction === "PAYMENT" ? "text-sm text-danger" : "text-sm text-success"}>{item.direction === "PAYMENT" ? "Ödeme" : "Tahsilat"} · {item.amount.toLocaleString("tr-TR")} {item.currency}</div></div>)}</div></div></div></div>;
}
