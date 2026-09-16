import { cookies } from "next/headers";
import { LoginPage } from "@/app/login/login-page";
import { sessionCookie, verifySession } from "@/lib/session";

function Dashboard() {
  const cards = [["Toplam sipariş", "0", "Henüz sipariş eklenmedi"], ["Üretimdeki işler", "0", "Henüz üretim işi yok"], ["Bekleyen teslimat", "0", "Henüz teslimat yok"], ["Kritik stok", "0", "Henüz malzeme eklenmedi"]];
  return <div className="min-h-screen px-6 py-6 lg:px-10"><header className="mb-8"><div className="eyebrow mb-2">OPERASYON MERKEZİ</div><h1 className="m-0 text-3xl font-semibold tracking-tight">Genel bakış</h1><p className="mt-2 text-sm text-muted">Sistem hazır. Verilerinizi ekleyerek başlayın.</p></header><section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, note]) => <div className="card p-5" key={label}><div className="eyebrow">{label}</div><div className="mt-3 text-3xl font-semibold text-accent">{value}</div><div className="mt-2 text-xs text-muted">{note}</div></div>)}</section><section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]"><div className="card p-7"><div className="eyebrow">İLK KURULUM</div><h2 className="mt-2 text-xl font-semibold">Sistemi adım adım kurun</h2><div className="mt-6 space-y-4">{["Depoları ve raf konumlarını oluşturun", "Malzemeleri ve başlangıç stoklarını ekleyin", "Ürünleri ve üretim reçetelerini tanımlayın", "Fabrikaları ve kullanıcı yetkilerini ekleyin", "Müşterileri, siparişleri ve cari hesapları oluşturun"].map((item, index) => <div className="flex items-center gap-3 text-sm text-muted" key={item}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-xs text-accent">{index + 1}</span>{item}</div>)}</div></div><div className="card p-7"><div className="eyebrow">SON HAREKETLER</div><h2 className="mt-2 text-xl font-semibold">Henüz hareket yok</h2><p className="mt-3 text-sm leading-6 text-muted">İlk ürün, malzeme, depo veya sipariş eklendiğinde tüm operasyon geçmişi burada görünecek.</p><div className="mt-8 rounded-lg border border-dashed border-line p-5 text-center text-xs text-muted">Temiz başlangıç · Demo veri yok</div></div></section></div>;
}

export default async function HomePage() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (token) { try { await verifySession(token); return <Dashboard />; } catch { /* Login below */ } }
  return <LoginPage />;
}
