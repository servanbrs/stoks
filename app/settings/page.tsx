"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Settings = { database?: string; schema?: string; storage?: string; integrations?: Record<string, boolean> };

const integrations = [
  ["AI görsel / video", "OPENAI_API_KEY", "Görsel varyasyonları ve video üretim sağlayıcısı"],
  ["E-posta", "SMTP_HOST · SMTP_USER · SMTP_PASSWORD", "Gerçek e-posta gönderimi"],
  ["Meta / Instagram", "META_ACCESS_TOKEN · META_PAGE_ID", "Instagram ve Facebook planlı yayın"],
  ["Pinterest", "PINTEREST_ACCESS_TOKEN · PINTEREST_BOARD_ID", "Pinterest pin planlama"],
  ["TikTok", "TIKTOK_ACCESS_TOKEN", "TikTok yayın ve creator bağlantısı"],
] as const;

type FxState = { current?: { rate: number; source: string; capturedAt: string }; history?: Array<{ id?: string; rate: number; source?: string; capturedAt?: string; createdAt?: string }> };

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [fx, setFx] = useState<FxState>({});
  const [rate, setRate] = useState("");
  const [fxMessage, setFxMessage] = useState("");
  async function loadFx() { const response = await fetch("/api/fx"); if (response.ok) setFx(await response.json()); }
  useEffect(() => {
    void fetch("/api/modules/settings").then((response) => response.json()).then(setSettings);
    void loadFx();
  }, []);
  async function saveRate() {
    const response = await fetch("/api/fx", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rate }) });
    const body = await response.json();
    if (!response.ok) { setFxMessage(body.error ?? "Kur kaydedilemedi."); return; }
    setFxMessage("Manuel kur kaydedildi. Eski işlemlerin kuru değişmez."); setRate(""); await loadFx();
  }
  return <div className="min-h-screen px-6 py-6 lg:px-10"><div className="mx-auto max-w-6xl">
    <div className="eyebrow">SİSTEM · AYARLAR</div><h1 className="mt-2 text-3xl font-semibold">Bağlantılar ve ayarlar</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Gizli anahtarlar uygulama ekranına yazılmaz. Local için `.env.local`, Hostinger için Dağıtımlar → Ortam değişkenleri alanını kullanın.</p>
    <section className="card mt-7 overflow-hidden"><div className="border-b border-line px-5 py-4"><div className="text-sm font-medium">Sistem durumu</div></div><div className="grid gap-4 p-5 sm:grid-cols-3"><div><div className="text-xs text-muted">Veritabanı</div><div className="mt-1 text-sm text-success">{settings.database ?? "Kontrol ediliyor..."}</div></div><div><div className="text-xs text-muted">Şema</div><div className="mt-1 text-sm">{settings.schema ?? "—"}</div></div><div><div className="text-xs text-muted">Dosya saklama</div><div className="mt-1 text-sm">{settings.storage ?? "—"}</div></div></div></section>
    <section className="card mt-6 overflow-hidden"><div className="border-b border-line px-5 py-4"><div className="text-sm font-medium">USD / TRY kuru</div><div className="mt-1 text-xs text-muted">Canlı kaynak yoksa manuel girin. Geçmiş işlemler snapshot kurunu korur.</div></div>
      <div className="grid gap-4 p-5 sm:grid-cols-[1fr_160px_auto]"><div><div className="text-xs text-muted">Güncel</div><div className="mt-1 text-2xl font-semibold text-accent">₺{Number(fx.current?.rate ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</div><div className="mt-1 text-[11px] text-muted">{fx.current?.source} · {fx.current?.capturedAt ? new Date(fx.current.capturedAt).toLocaleString("tr-TR") : ""}</div></div>
      <input type="number" min="0.01" step="0.0001" value={rate} onChange={(event) => setRate(event.target.value)} placeholder="Manuel kur" className="self-end rounded-lg border border-line bg-[#0d1219] p-3 text-sm" />
      <button type="button" onClick={() => void saveRate()} className="self-end rounded-lg bg-accent px-4 py-3 text-sm font-bold text-ink">Kaydet</button></div>
      {fxMessage && <div className="px-5 pb-3 text-sm text-success">{fxMessage}</div>}
      <div className="divide-y divide-line border-t border-line">{(fx.history ?? []).slice(0, 8).map((item, index) => <div className="flex justify-between px-5 py-3 text-xs text-muted" key={item.id ?? index}><span>{item.source ?? "kayıt"}</span><span>₺{Number(item.rate).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} · {new Date(item.capturedAt ?? item.createdAt ?? "").toLocaleString("tr-TR")}</span></div>)}</div>
    </section>
    <section className="card mt-6 overflow-hidden"><div className="border-b border-line px-5 py-4"><div className="text-sm font-medium">Dış servis bağlantıları</div><div className="mt-1 text-xs text-muted">Değerleri Hostinger ortam değişkenlerine ekledikten sonra yeniden dağıtım yapın.</div></div><div className="divide-y divide-line">{integrations.map(([name, keys, description]) => <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4" key={name}><div><div className="text-sm font-medium">{name}</div><div className="mt-1 text-xs text-muted">{description}</div><code className="mt-2 block text-[11px] text-accent">{keys}</code></div><span className={`rounded-full border px-3 py-1 text-xs ${settings.integrations?.[name] ? "border-success/30 text-success" : "border-line text-muted"}`}>{settings.integrations?.[name] ? "Bağlı" : "Bekliyor"}</span></div>)}</div></section>
    <section className="card mt-6 p-5"><div className="text-sm font-medium">Hızlı yönlendirme</div><div className="mt-4 flex flex-wrap gap-3"><Link href="/sales" className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-ink">Satış merkezine git</Link><Link href="/influencers" className="rounded-lg border border-line px-4 py-2.5 text-sm text-muted hover:text-white">Influencer iş birlikleri</Link></div></section>
  </div></div>;
}
