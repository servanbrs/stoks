import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0a0d12] px-5 py-10">
      <div className="w-full max-w-[430px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-xl bg-accent text-xl font-black text-ink">S</div>
          <div className="text-lg font-bold tracking-[.24em]">STOKS</div>
          <div className="mt-2 text-xs uppercase tracking-[.16em] text-muted">Operasyon merkezi</div>
        </div>

        <section className="card p-7 sm:p-9">
          <div className="eyebrow">GÜVENLİ GİRİŞ</div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Tekrar hoş geldin</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Operasyonlarını yönetmek için hesabına giriş yap.</p>

          <form className="mt-7 space-y-5" action="/">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#cbd2dc]">E-posta adresi</span>
              <input className="w-full rounded-lg border border-line bg-[#0d1219] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-[#596575] focus:border-accent" type="email" name="email" placeholder="ornek@sirket.com" autoComplete="email" required />
            </label>
            <label className="block">
              <div className="mb-2 flex items-center justify-between"><span className="text-xs font-medium text-[#cbd2dc]">Şifre</span><button type="button" className="text-xs text-accent hover:text-[#e1c58f]">Şifremi unuttum</button></div>
              <input className="w-full rounded-lg border border-line bg-[#0d1219] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-[#596575] focus:border-accent" type="password" name="password" placeholder="••••••••" autoComplete="current-password" required />
            </label>
            <label className="flex items-center gap-2 text-xs text-muted"><input type="checkbox" className="accent-accent" name="remember" /> Beni bu cihazda hatırla</label>
            <button className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-bold text-ink transition hover:bg-[#d9ba7b]" type="submit">Giriş yap</button>
          </form>

          <div className="mt-6 border-t border-line pt-5 text-center text-xs leading-5 text-muted">Demo arayüzü · Gerçek giriş doğrulaması veritabanı ve RBAC bağlantısından sonra aktifleşecek.</div>
        </section>

        <Link href="/" className="mt-6 block text-center text-xs text-muted transition hover:text-white">← Dashboard’a dön</Link>
      </div>
    </main>
  );
}
