"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); setError(""); const response = await fetch("/api/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); if (!response.ok) { const body = await response.json() as { error?: string }; setError(body.error ?? "Kurulum yapılamadı."); return; } router.replace("/login"); }
  return <main className="grid min-h-screen place-items-center bg-[#0a0d12] px-5 py-10"><div className="w-full max-w-[430px]"><div className="mb-8 text-center"><div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-xl bg-accent text-xl font-black text-ink">S</div><div className="text-lg font-bold tracking-[.24em]">STOKS</div><div className="mt-2 text-xs uppercase tracking-[.16em] text-muted">İlk kurulum</div></div><section className="card p-7 sm:p-9"><div className="eyebrow">ADMIN HESABI</div><h1 className="mt-3 text-2xl font-semibold">Sistemi başlat</h1><p className="mt-2 text-sm leading-6 text-muted">İlk yönetici hesabını oluştur. Bu ekrandan sonra tüm kayıtları kendin ekleyebilirsin.</p><form className="mt-7 space-y-4" onSubmit={submit}>{[["name", "Ad soyad", "Mehmet Yılmaz", "text"], ["email", "E-posta", "ornek@sirket.com", "email"], ["password", "Şifre", "En az 8 karakter", "password"]].map(([key, label, placeholder, type]) => <label className="block" key={key}><span className="mb-2 block text-xs font-medium text-[#cbd2dc]">{label}</span><input className="w-full rounded-lg border border-line bg-[#0d1219] px-3.5 py-3 text-sm text-white outline-none focus:border-accent" type={type} value={form[key as keyof typeof form]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={placeholder} required /></label>)}{error && <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">{error}</div>}<button className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-bold text-ink" type="submit">Admin hesabını oluştur</button></form></section><Link href="/login" className="mt-6 block text-center text-xs text-muted hover:text-white">← Giriş ekranına dön</Link></div></main>;
}
