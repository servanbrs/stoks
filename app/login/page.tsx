"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [returnTo, setReturnTo] = useState("/");

  useEffect(() => { setReturnTo(new URLSearchParams(window.location.search).get("returnTo") ?? "/"); }, []);

  async function login(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!response.ok) { const body = await response.json() as { error?: string }; setError(body.error ?? "Giriş yapılamadı."); setLoading(false); return; }
    router.replace(returnTo); router.refresh();
  }

  return <main className="grid min-h-screen place-items-center bg-[#0a0d12] px-5 py-10"><div className="w-full max-w-[430px]"><div className="mb-8 text-center"><div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-xl bg-accent text-xl font-black text-ink">S</div><div className="text-lg font-bold tracking-[.24em]">STOKS</div><div className="mt-2 text-xs uppercase tracking-[.16em] text-muted">Operasyon merkezi</div></div><section className="card p-7 sm:p-9"><div className="eyebrow">GÜVENLİ GİRİŞ</div><h1 className="mt-3 text-2xl font-semibold tracking-tight">Tekrar hoş geldin</h1><p className="mt-2 text-sm leading-6 text-muted">Operasyonlarını yönetmek için hesabına giriş yap.</p><form className="mt-7 space-y-5" onSubmit={login}><label className="block"><span className="mb-2 block text-xs font-medium text-[#cbd2dc]">E-posta adresi</span><input className="w-full rounded-lg border border-line bg-[#0d1219] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-[#596575] focus:border-accent" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ornek@sirket.com" autoComplete="email" required /></label><label className="block"><span className="mb-2 block text-xs font-medium text-[#cbd2dc]">Şifre</span><input className="w-full rounded-lg border border-line bg-[#0d1219] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-[#596575] focus:border-accent" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete="current-password" required /></label>{error && <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">{error}</div>}<button className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-bold text-ink transition hover:bg-[#d9ba7b] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={loading}>{loading ? "Kontrol ediliyor..." : "Giriş yap"}</button></form><div className="mt-6 border-t border-line pt-5 text-xs leading-5 text-muted"><div className="font-medium text-accent">İlk kurulum</div><div className="mt-1">Henüz kullanıcı oluşturmadıysanız ilk admin hesabını oluşturun.</div><Link href="/setup" className="mt-2 inline-block text-accent hover:underline">İlk admin hesabını oluştur →</Link></div></section><Link href="/login" className="mt-6 block text-center text-xs text-muted transition hover:text-white">Stoks güvenli giriş</Link></div></main>;
}
