import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sessionCookie, verifySession } from "@/lib/session";

export const runtime = "nodejs";

async function currentUser() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  try {
    const session = await verifySession(token);
    return await db.user.findUnique({ where: { email: session.email }, select: { id: true, email: true, role: true } });
  } catch { return null; }
}
function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function number(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : NaN; }
function code(prefix: string) { return `${prefix}-${Date.now().toString(36).toUpperCase()}`; }

export async function GET(_request: NextRequest, context: { params: Promise<{ module: string }> }) {
  if (!await currentUser()) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const { module } = await context.params;
  if (module === "materials") return NextResponse.json(await db.material.findMany({ orderBy: { createdAt: "desc" } }));
  if (module === "products") return NextResponse.json(await db.product.findMany({ include: { components: { include: { material: true } } }, orderBy: { createdAt: "desc" } }));
  if (module === "warehouses") return NextResponse.json(await db.warehouse.findMany({ include: { stocks: true }, orderBy: { createdAt: "desc" } }));
  if (module === "factories") return NextResponse.json(await db.factory.findMany({ include: { users: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "desc" } }));
  if (module === "customers") return NextResponse.json(await db.customer.findMany({ include: { orders: { select: { id: true, orderNo: true, status: true, total: true, currency: true } } }, orderBy: { createdAt: "desc" } }));
  if (module === "orders") return NextResponse.json(await db.customerOrder.findMany({ include: { customer: true, items: { include: { product: true } } }, orderBy: { createdAt: "desc" } }));
  if (module === "production") return NextResponse.json(await db.productionJob.findMany({ orderBy: { createdAt: "desc" } }));
  if (module === "shipments") return NextResponse.json(await db.shipment.findMany({ orderBy: { createdAt: "desc" } }));
  if (module === "stock-movements") return NextResponse.json(await db.stockMovement.findMany({ include: { material: true, product: true, user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 100 }));
  if (module === "activity") return NextResponse.json(await db.auditLog.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 100 }));
  return NextResponse.json({ error: "Bilinmeyen modül." }, { status: 404 });
}

export async function POST(request: NextRequest, context: { params: Promise<{ module: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const { module } = await context.params;
  const body = await request.json() as Record<string, unknown>;
  try {
    let created: { id: string };
    if (module === "materials") {
      const name = text(body.name), sku = text(body.sku);
      if (!name || !sku) return NextResponse.json({ error: "Malzeme adı ve SKU zorunlu." }, { status: 400 });
      created = await db.material.create({ data: { name, sku, category: text(body.category) || "Genel", unit: text(body.unit) || "adet", minimumStock: number(body.minimumStock) || 0, criticalStock: number(body.criticalStock) || 0, supplier: text(body.supplier) || null } });
    } else if (module === "products") {
      const name = text(body.name), sku = text(body.sku);
      if (!name || !sku) return NextResponse.json({ error: "Ürün adı ve SKU zorunlu." }, { status: 400 });
      created = await db.product.create({ data: { name, sku, brand: text(body.brand) || null, barcode: text(body.barcode) || null, volumeMl: number(body.volumeMl) || null, salePrice: number(body.salePrice) || null, currency: text(body.currency) === "USD" ? "USD" : "TRY" } });
    } else if (module === "warehouses") {
      const name = text(body.name); if (!name) return NextResponse.json({ error: "Depo adı zorunlu." }, { status: 400 });
      created = await db.warehouse.create({ data: { name } });
    } else if (module === "factories") {
      const name = text(body.name); if (!name) return NextResponse.json({ error: "Fabrika adı zorunlu." }, { status: 400 });
      created = await db.factory.create({ data: { name, contact: text(body.contact) || null, phone: text(body.phone) || null, address: text(body.address) || null, notes: text(body.notes) || null } });
    } else if (module === "customers") {
      const name = text(body.name); if (!name) return NextResponse.json({ error: "Müşteri adı zorunlu." }, { status: 400 });
      created = await db.customer.create({ data: { name, contact: text(body.contact) || null, phone: text(body.phone) || null, address: text(body.address) || null, notes: text(body.notes) || null, currency: text(body.currency) === "USD" ? "USD" : "TRY" } });
    } else if (module === "orders") {
      const customerId = text(body.customerId), total = number(body.total);
      if (!customerId || !Number.isFinite(total)) return NextResponse.json({ error: "Müşteri ve toplam tutar zorunlu." }, { status: 400 });
      created = await db.customerOrder.create({ data: { orderNo: code("SIP"), customerId, createdById: user.id, currency: text(body.currency) === "USD" ? "USD" : "TRY", total, status: "NEW" } });
    } else if (module === "production") {
      const title = text(body.title); if (!title) return NextResponse.json({ error: "Üretim işi adı zorunlu." }, { status: 400 });
      created = await db.productionJob.create({ data: { jobNo: code("URE"), title, factoryName: text(body.factoryName) || null, quantity: number(body.quantity) || 0, notes: text(body.notes) || null } });
    } else if (module === "shipments") {
      const fromName = text(body.fromName), toName = text(body.toName), itemSummary = text(body.itemSummary);
      if (!fromName || !toName || !itemSummary) return NextResponse.json({ error: "Çıkış, varış ve içerik zorunlu." }, { status: 400 });
      created = await db.shipment.create({ data: { shipmentNo: code("SEV"), fromName, toName, itemSummary, quantity: number(body.quantity) || 0, notes: text(body.notes) || null } });
    } else return NextResponse.json({ error: "Bu modülde kayıt ekleme henüz desteklenmiyor." }, { status: 400 });
    await db.auditLog.create({ data: { userId: user.id, action: "CREATE", entity: module, entityId: created.id, metadata: JSON.parse(JSON.stringify(body)) } });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kayıt oluşturulamadı. Zorunlu alanları ve benzersiz SKU değerini kontrol edin." }, { status: 400 });
  }
}
