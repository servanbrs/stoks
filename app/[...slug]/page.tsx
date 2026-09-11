import Link from "next/link";

const modules: Record<string, { title: string; eyebrow: string; description: string; next: string[] }> = {
  orders: { title: "Siparişler", eyebrow: "GÜNLÜK İŞLER", description: "Müşteri siparişlerini, stok durumunu ve üretime aktarılacak eksikleri buradan takip edeceksiniz.", next: ["Sipariş oluşturma", "Stok yeterlilik kontrolü", "Siparişten üretim işi oluşturma"] },
  production: { title: "Üretim işleri", eyebrow: "GÜNLÜK İŞLER", description: "Reçeteye göre üretim emirleri, eksik malzemeler ve fabrika ilerlemeleri bu ekranda toplanacak.", next: ["Üretim emri ve BOM", "Eksik malzeme uyarısı", "Üretim maliyet snapshotı"] },
  shipments: { title: "Sevk ve teslimat", eyebrow: "GÜNLÜK İŞLER", description: "Malzemenin depodan fabrikaya gidişini, fotoğraflı teslim kanıtını ve uyuşmazlıkları yönetin.", next: ["Fabrika sevki", "Fotoğraflı teslim", "Sağlam / kırık / eksik kayıtları"] },
  factories: { title: "Fason fabrikalar", eyebrow: "CARİ VE KAYITLAR", description: "Çalışılan fabrikaları, aktif işleri ve fabrika stoklarını tek ekrandan görün.", next: ["Fabrika kartları", "Aktif üretimler", "Hakediş ve teslim geçmişi"] },
};

export default async function ModulePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug[0];
  const moduleData = modules[key] ?? { title: "Modül", eyebrow: "STOKS", description: "Bu bölüm operasyon merkezi içinde hazırlanıyor.", next: ["Yetkili kullanıcılar", "Filtrelenebilir listeler", "Audit geçmişi"] };
  return <div className="min-h-screen px-6 py-6 lg:px-10"><div className="mx-auto max-w-5xl"><Link href="/" className="text-sm text-muted hover:text-white">← Genel bakışa dön</Link><div className="mt-12 max-w-2xl"><div className="eyebrow mb-3">{moduleData.eyebrow}</div><h1 className="m-0 text-4xl font-semibold tracking-tight">{moduleData.title}</h1><p className="mt-4 text-base leading-7 text-muted">{moduleData.description}</p></div><div className="mt-10 grid gap-4 md:grid-cols-3">{moduleData.next.map((item, index) => <div className="card p-5" key={item}><div className="mb-8 grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">0{index + 1}</div><div className="font-medium">{item}</div><div className="mt-2 text-xs leading-5 text-muted">Bu iş akışı gerçek veritabanı bağlantısı eklendiğinde burada çalışacak.</div></div>)}</div><div className="mt-8 rounded-xl border border-accent/25 bg-accent/5 p-5"><div className="text-sm font-medium text-accent">İpucu</div><p className="mb-0 mt-2 text-sm leading-6 text-muted">Menüde bir bölümün altındaki küçük açıklama, o bölümün ne işe yaradığını gösterir. Günlük iş akışı yukarıdan aşağıya ilerler: sipariş → üretim → sevk ve teslimat.</p></div></div></div>;
}
