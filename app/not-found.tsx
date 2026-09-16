import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center px-6"><div className="card max-w-md p-8 text-center"><div className="eyebrow">STOKS · 404</div><h1 className="mt-3 text-3xl font-semibold">Sayfa bulunamadı</h1><p className="mt-3 text-sm leading-6 text-muted">Bu operasyon ekranı taşınmış veya silinmiş olabilir.</p><Link href="/" className="mt-6 inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-ink">Genel bakışa dön</Link></div></main>;
}
