"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DbStatus = { configured: boolean; connected: boolean; tablesReady: boolean; userCount?: number; message: string };

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);

  async function checkDatabase() {
    setChecking(true);
    const response = await fetch("/api/setup/status", { cache: "no-store" });
    const data = await response.json() as DbStatus;
    if (data.userCount && data.userCount > 0) { router.replace("/login"); return; }
    setStatus(data);
    setChecking(false);
  }

  useEffect(() => { void checkDatabase(); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setSaving(true);
    const response = await fetch("/api/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!response.ok) { const body = await response.json() as { error?: string }; setError(body.error ?? "Kurulum yapılamadı."); setSaving(false); return; }
    router.replace("/login");
  }

  const ready = Boolean(status?.connected && status.tablesReady && status.userCount === 0);
  return <main className="grid min-h-screen place-items-center bg-[#0a0d12] px-5 py-10"><div className="w-full max-w-[520px]"><div className="mb-8 text-center"><div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-xl bg-accent text-xl font-black text-ink">S</div><div className="text-lg font-bold tracking-[.24em]">STOKS</div><div className="mt-2 text-xs uppercase tracking-[.16em] text-muted">İlk kurulum</div></div><section className="card p-7 sm:p-9"><div className="eyebrow">ADIM 1 · VERİTABANI</div><h1 className="mt-3 text-2xl font-semibold">Bağlantıyı kontrol et</h1><p className="mt-2 text-sm leading-6 text-muted">Önce Hostinger MySQL bağlantısını doğrulayalım. Bağlantı ve tablolar hazır olmadan admin hesabı oluşturulmaz.</p><div className="mt-6 rounded-lg border border-line bg-[#0d1219] p-4"><div className="flex items-center justify-between"><span className="text-sm font-medium">MySQL bağlantısı</span><button onClick={() => void checkDatabase()} className="text-xs text-accent hover:underline" type="button">{checking ? "Kontrol ediliyor..." : "Tekrar kontrol et"}</button></div><div className="mt-3 space-y-2 text-xs"><div className="flex justify-between"><span className="text-muted">DATABASE_URL</span><span className={status?.configured ? "text-success" : "text-danger"}>{status?.configured ? "Tanımlı" : "Eksik"}</span></div><div className="flex justify-between"><span className="text-muted">MySQL erişimi</span><span className={status?.connected ? "text-success" : "text-danger"}>{status?.connected ? "Bağlandı" : "Bağlanamadı"}</span></div><div className="flex justify-between"><span className="text-muted">Stoks tabloları</span><span className={status?.tablesReady ? "text-success" : "text-danger"}>{status?.tablesReady ? "Hazır" : "Hazır değil"}</span></div></div>{status?.message && <div className={`mt-3 border-t border-line pt-3 text-xs ${status.connected && status.tablesReady ? "text-success" : "text-danger"}`}>{status.message}</div>}</div>{status?.connected && !status.tablesReady && <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs leading-5 text-muted">Bağlantı var fakat tablolar yok. Proje klasöründe `npx prisma migrate deploy` çalıştırıp tekrar kontrol edin.</div>}{status?.userCount && status.userCount > 0 ? <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs text-accent">İlk admin hesabı daha önce oluşturulmuş. Giriş ekranına geçebilirsiniz.</div> : <form className="mt-7 space-y-4" onSubmit={submit}><div className="eyebrow">ADIM 2 · İLK ADMIN</div>{[["name", "Ad soyad", "Mehmet Yılmaz", "text"], ["email", "E-posta", "ornek@sirket.com", "email"], ["password", "Şifre", "En az 8 karakter", "password"]].map(([key, label, placeholder, type]) => <label className="block" key={key}><span className="mb-2 block text-xs font-medium text-[#cbd2dc]">{label}</span><input className="w-full rounded-lg border border-line bg-[#0d1219] px-3.5 py-3 text-sm text-white outline-none focus:border-accent disabled:opacity-50" type={type} value={form[key as keyof typeof form]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={placeholder} disabled={!ready || saving} required /></label>)}{error && <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">{error}</div>}<button className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-40" type="submit" disabled={!ready || saving}>{saving ? "Oluşturuluyor..." : "İlk admin hesabını oluştur"}</button></form>}</section><Link href="/login" className="mt-6 block text-center text-xs text-muted hover:text-white">← Giriş ekranına dön</Link></div></main>;
}
