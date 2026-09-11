export type NavItem = { label: string; href: string; icon: string; description?: string };
export type NavSection = { label?: string; description?: string; items: NavItem[] };

export const navigation: NavSection[] = [
  { items: [{ label: "Genel bakış", href: "/", icon: "⌂", description: "Tüm operasyonun özeti" }] },
  { label: "GÜNLÜK İŞLER", description: "Siparişten teslimata", items: [
    { label: "Siparişler", href: "/orders", icon: "↗", description: "Müşteri talepleri" },
    { label: "Üretim işleri", href: "/production", icon: "◫", description: "Üretim ve reçeteler" },
    { label: "Sevk ve teslimat", href: "/shipments", icon: "➜", description: "Fabrika süreçleri" },
  ] },
  { label: "STOK", description: "Ne var, nerede var?", items: [
    { label: "Stok özeti", href: "/stock-movements", icon: "↔", description: "Hareket ve kritikler" },
    { label: "Malzemeler", href: "/materials", icon: "◈", description: "Şişe, valf, esans..." },
    { label: "Ürünler", href: "/products", icon: "▣", description: "Bitmiş ürünler" },
    { label: "Depolar", href: "/warehouses", icon: "▤", description: "Depo bakiyeleri" },
  ] },
  { label: "CARİ VE KAYITLAR", description: "İnsanlar ve finans", items: [
    { label: "Müşteriler", href: "/customers", icon: "♙", description: "Cari hesaplar" },
    { label: "Fabrikalar", href: "/factories", icon: "⌁", description: "Fason üretim" },
    { label: "Cari / ödemeler", href: "/finance", icon: "₺", description: "Tahsilat ve hakediş" },
  ] },
  { label: "SİSTEM", items: [
    { label: "Aktivite geçmişi", href: "/activity", icon: "☷" },
    { label: "Ayarlar", href: "/settings", icon: "⚙" },
  ] },
];
