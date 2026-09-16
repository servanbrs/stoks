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

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  useEffect(() => { void fetch("/api/modules/settings").then((response) => response.json()).then(setSettings); }, []);
  return <div className="min-h-screen px-6 py-6 lg:px-10"><div className="mx-auto max-w-6xl">
    <div className="eyebrow">SİSTEM · AYARLAR</div><h1 className="mt-2 text-3xl font-semibold">Bağlantılar ve ayarlar</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Gizli anahtarlar uygulama ekranına yazılmaz. Local için `.env.local`, Hostinger için Dağıtımlar → Ortam değişkenleri alanını kullanın.</p>
    <section className="card mt-7 overflow-hidden"><div className="border-b border-line px-5 py-4"><div className="text-sm font-medium">Sistem durumu</div></div><div className="grid gap-4 p-5 sm:grid-cols-3"><div><div className="text-xs text-muted">Veritabanı</div><div className="mt-1 text-sm text-success">{settings.database ?? "Kontrol ediliyor..."}</div></div><div><div className="text-xs text-muted">Şema</div><div className="mt-1 text-sm">{settings.schema ?? "—"}</div></div><div><div className="text-xs text-muted">Dosya saklama</div><div className="mt-1 text-sm">{settings.storage ?? "—"}</div></div></div></section>
    <section className="card mt-6 overflow-hidden"><div className="border-b border-line px-5 py-4"><div className="text-sm font-medium">Dış servis bağlantıları</div><div className="mt-1 text-xs text-muted">Değerleri Hostinger ortam değişkenlerine ekledikten sonra yeniden dağıtım yapın.</div></div><div className="divide-y divide-line">{integrations.map(([name, keys, description]) => <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4" key={name}><div><div className="text-sm font-medium">{name}</div><div className="mt-1 text-xs text-muted">{description}</div><code className="mt-2 block text-[11px] text-accent">{keys}</code></div><span className={`rounded-full border px-3 py-1 text-xs ${settings.integrations?.[name] ? "border-success/30 text-success" : "border-line text-muted"}`}>{settings.integrations?.[name] ? "Bağlı" : "Bekliyor"}</span></div>)}</div></section>
    <section className="card mt-6 p-5"><div className="text-sm font-medium">Hızlı yönlendirme</div><div className="mt-4 flex flex-wrap gap-3"><Link href="/sales" className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-ink">Satış merkezine git</Link><Link href="/influencers" className="rounded-lg border border-line px-4 py-2.5 text-sm text-muted hover:text-white">Influencer iş birlikleri</Link></div></section>
  </div></div>;
}
