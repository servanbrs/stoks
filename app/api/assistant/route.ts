import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sessionCookie, verifySession } from "@/lib/session";

export const runtime = "nodejs";

async function currentUser() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  try { const session = await verifySession(token); return await db.user.findUnique({ where: { email: session.email }, select: { id: true, role: true } }); } catch { return null; }
}

function money(value: number) { return value.toLocaleString("tr-TR", { maximumFractionDigits: 2 }); }

export async function POST(request: NextRequest) {
  if (!await currentUser()) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const body = await request.json() as { message?: string };
  const message = body.message?.trim() || "";
  if (!message) return NextResponse.json({ reply: "Buradayım. Bugünün planını, eksik stokları, açık fabrika işlerini veya cari kayıtları sorabilirsin.", actions: [] });
  const normalized = message.toLocaleLowerCase("tr-TR");
  const [materials, jobs, requests, shipments] = await Promise.all([
    db.material.findMany({ include: { stocks: true }, orderBy: { name: "asc" } }),
    db.productionJob.findMany({ where: { status: { in: ["QUEUED", "IN_PROGRESS"] } }, orderBy: { createdAt: "asc" } }),
    db.materialRequest.findMany({ where: { status: { in: ["REQUESTED", "APPROVED", "ORDERED", "IN_TRANSIT"] } }, include: { material: true }, orderBy: { createdAt: "asc" } }),
    db.shipment.findMany({ where: { status: { in: ["PREPARING", "IN_TRANSIT"] } }, orderBy: { createdAt: "asc" } }),
  ]);
  const shortages = materials.map((material) => ({ ...material, total: material.stocks.reduce((sum, stock) => sum + Number(stock.quantity), 0) })).filter((material) => material.total <= Number(material.criticalStock) || material.total <= Number(material.minimumStock));
  const actions = [{ label: "Stok özeti", href: "/stock-movements" }, { label: "Üretim işleri", href: "/production" }, { label: "Talepler", href: "/requests" }];
  if (normalized.includes("ödeme") || normalized.includes("cari") || normalized.includes("para")) return NextResponse.json({ reply: "Cari ve ödeme hareketlerini birlikte inceleyebilir, yeni ödeme veya tahsilat ekleyebilirsin.", actions: [{ label: "Cariyi aç", href: "/finance" }] });
  if (normalized.includes("talep") || normalized.includes("eksik") || normalized.includes("stok")) {
    const detail = shortages.length ? shortages.map((item) => `${item.name}: ${money(item.total)} ${item.unit} kaldı (kritik: ${money(Number(item.criticalStock))})`).join("\n") : "Kritik seviyenin altında görünen malzeme yok.";
    return NextResponse.json({ reply: `Stok kontrolü tamamlandı.\n\n${detail}\n\n${requests.length} açık malzeme talebi var. Eksik çıkanları talep ekranından siparişe çevirebilirsin.`, actions: [{ label: "Malzeme talepleri", href: "/requests" }, { label: "Malzeme kartları", href: "/materials" }] });
  }
  if (normalized.includes("fabrika") || normalized.includes("iş") || normalized.includes("üretim")) return NextResponse.json({ reply: `${jobs.length} açık üretim işi ve ${shipments.length} bekleyen sevk var.\n\n${jobs.length ? jobs.map((job) => `${job.jobNo} · ${job.title} · ${job.factoryName || "fabrika atanmadı"} · ${job.quantity} adet`).join("\n") : "Açık üretim işi yok."}\n\nÖnce acil işi fabrikaya atamanı, sonra sevk fotoğrafını ve teslim kanıtını tamamlamanı öneriyorum.`, actions: [{ label: "Üretim işleri", href: "/production" }, { label: "Sevkler", href: "/shipments" }, { label: "Kanıtlar", href: "/deliveries" }] });
  const plan = [`${shortages.length} kritik stok kalemi`, `${jobs.length} açık üretim işi`, `${requests.length} açık malzeme talebi`, `${shipments.length} bekleyen sevk`];
  return NextResponse.json({ reply: `Bugünkü operasyon özeti:\n\n${plan.join("\n")}\n\nÖnerilen sıra:\n1. Kritik stokları ve sipariş yenilemelerini kontrol edelim.\n2. Açık üretim işlerini fabrikalara göre sıralayalım.\n3. Bekleyen sevk ve teslimat fotoğraflarını tamamlayalım.\n4. Gün sonunda cari ve aktivite kayıtlarını kapatalım.`, actions });
}
