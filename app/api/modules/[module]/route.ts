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
  if (module === "materials") return NextResponse.json(await db.material.findMany({ include: { stocks: { include: { warehouse: true } } }, orderBy: { createdAt: "desc" } }));
  if (module === "products") return NextResponse.json(await db.product.findMany({ include: { components: { include: { material: true } } }, orderBy: { createdAt: "desc" } }));
  if (module === "warehouses") return NextResponse.json(await db.warehouse.findMany({ include: { stocks: { include: { material: true, product: true } } }, orderBy: { createdAt: "desc" } }));
  if (module === "factories") return NextResponse.json(await db.factory.findMany({ include: { users: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "desc" } }));
  if (module === "customers") return NextResponse.json(await db.customer.findMany({ include: { orders: { select: { id: true, orderNo: true, status: true, total: true, currency: true } } }, orderBy: { createdAt: "desc" } }));
  if (module === "orders") return NextResponse.json(await db.customerOrder.findMany({ include: { customer: true, items: { include: { product: true } } }, orderBy: { createdAt: "desc" } }));
  if (module === "production") return NextResponse.json(await db.productionJob.findMany({ orderBy: { createdAt: "desc" } }));
  if (module === "shipments") return NextResponse.json(await db.shipment.findMany({ orderBy: { createdAt: "desc" } }));
  if (module === "stock-movements") return NextResponse.json(await db.stockMovement.findMany({ include: { material: true, product: true, user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 100 }));
  if (module === "activity") return NextResponse.json(await db.auditLog.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 100 }));
  if (module === "finance") return NextResponse.json(await db.payment.findMany({ orderBy: { createdAt: "desc" }, take: 200 }));
  if (module === "requests") return NextResponse.json(await db.materialRequest.findMany({ include: { material: true, requestedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } }));
  if (module === "settings") return NextResponse.json({ database: "Bağlı", schema: "Prisma/MySQL", storage: process.env.STORAGE_DRIVER || "local", note: "Ortam değişkenleri Hostinger panelinden yönetilir." });
  if (module === "invoices") return NextResponse.json(await db.invoice.findMany({ include: { customer: true, order: true }, orderBy: { issueDate: "desc" } }));
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
      const name = text(body.name), sku = text(body.sku) || `MLZ-${Date.now().toString(36).toUpperCase()}`;
      if (!name) return NextResponse.json({ error: "Malzeme adı zorunlu." }, { status: 400 });
      created = await db.material.create({ data: { name, sku, category: text(body.category) || "Genel", unit: text(body.unit) || "adet", minimumStock: number(body.minimumStock) || 0, criticalStock: number(body.criticalStock) || 0, supplier: text(body.supplier) || null } });
      const warehouseId = text(body.warehouseId);
      if (warehouseId) await db.warehouseStock.create({ data: { warehouseId, materialId: created.id, quantity: number(body.quantity) || 0, locationCode: text(body.locationCode) || null, shelfCode: text(body.shelfCode) || null, unitCost: number(body.unitCost) || null, photoPath: text(body.photoPath) || null } });
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
    } else if (module === "finance") {
      const partyName = text(body.partyName), amount = number(body.amount);
      if (!partyName || !Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Kişi/firma ve geçerli tutar zorunlu." }, { status: 400 });
      created = await db.payment.create({ data: { partyName, amount, currency: text(body.currency) === "USD" ? "USD" : "TRY", direction: text(body.direction) === "COLLECTION" ? "COLLECTION" : "PAYMENT", description: text(body.description) || null, createdById: user.id } });
    } else if (module === "requests") {
      const materialId = text(body.materialId), quantity = number(body.quantity);
      if (!materialId || !Number.isFinite(quantity) || quantity <= 0) return NextResponse.json({ error: "Malzeme ve geçerli miktar zorunlu." }, { status: 400 });
      created = await db.materialRequest.create({ data: { requestNo: code("TLP"), materialId, requestedById: user.id, quantity, unit: text(body.unit) || "adet", notes: text(body.notes) || null } });
    } else if (module === "stock-movements") {
      const warehouseId = text(body.warehouseId), materialId = text(body.materialId), quantity = number(body.quantity);
      if (!warehouseId || !materialId || !Number.isFinite(quantity) || quantity === 0) return NextResponse.json({ error: "Depo, malzeme ve sıfır olmayan miktar zorunlu." }, { status: 400 });
      const existing = await db.warehouseStock.findFirst({ where: { warehouseId, materialId, productId: null } });
      const nextQuantity = Number(existing?.quantity ?? 0) + quantity;
      if (nextQuantity < 0) return NextResponse.json({ error: "Stok miktarı eksiye düşemez." }, { status: 400 });
      if (existing) await db.warehouseStock.update({ where: { id: existing.id }, data: { quantity: nextQuantity, locationCode: text(body.locationCode) || existing.locationCode, shelfCode: text(body.shelfCode) || existing.shelfCode, unitCost: number(body.unitCost) || existing.unitCost } });
      else await db.warehouseStock.create({ data: { warehouseId, materialId, quantity: nextQuantity, locationCode: text(body.locationCode) || null, shelfCode: text(body.shelfCode) || null, unitCost: number(body.unitCost) || null } });
      created = await db.stockMovement.create({ data: { type: quantity > 0 ? "PURCHASE" : "ADJUSTMENT", quantity: Math.abs(quantity), unitCost: number(body.unitCost) || null, currency: text(body.currency) === "USD" ? "USD" : "TRY", description: text(body.description) || null, userId: user.id, targetWarehouseId: warehouseId, materialId } });
    } else if (module === "invoices") {
      const customerId = text(body.customerId), total = number(body.total), subtotal = number(body.subtotal) || total, tax = number(body.tax) || 0;
      if (!customerId || !Number.isFinite(total) || total <= 0) return NextResponse.json({ error: "Müşteri ve geçerli toplam zorunlu." }, { status: 400 });
      created = await db.invoice.create({ data: { invoiceNo: code("FAT"), customerId, subtotal, tax, total, currency: text(body.currency) === "USD" ? "USD" : "TRY", notes: text(body.notes) || null } });
    } else return NextResponse.json({ error: "Bu modülde kayıt ekleme henüz desteklenmiyor." }, { status: 400 });
    await db.auditLog.create({ data: { userId: user.id, action: "CREATE", entity: module, entityId: created.id, metadata: JSON.parse(JSON.stringify(body)) } });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kayıt oluşturulamadı. Zorunlu alanları ve benzersiz SKU değerini kontrol edin." }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ module: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const { module } = await context.params;
  const body = await request.json() as Record<string, unknown>;
  const id = text(body.id);
  if (!id) return NextResponse.json({ error: "Kayıt ID zorunlu." }, { status: 400 });
  try {
    let updated;
    if (module === "materials") {
      const name = text(body.name);
      if (!name) return NextResponse.json({ error: "Malzeme adı zorunlu." }, { status: 400 });
      updated = await db.material.update({ where: { id }, data: { name, sku: text(body.sku) || undefined, category: text(body.category) || "Genel", unit: text(body.unit) || "adet", minimumStock: number(body.minimumStock) || 0, criticalStock: number(body.criticalStock) || 0, supplier: text(body.supplier) || null } });
    } else if (module === "products") {
      updated = await db.product.update({ where: { id }, data: { name: text(body.name), sku: text(body.sku), brand: text(body.brand) || null, barcode: text(body.barcode) || null, volumeMl: number(body.volumeMl) || null, salePrice: number(body.salePrice) || null, currency: text(body.currency) === "USD" ? "USD" : "TRY" } });
    } else if (module === "warehouses") {
      updated = await db.warehouse.update({ where: { id }, data: { name: text(body.name) } });
    } else if (module === "factories") {
      updated = await db.factory.update({ where: { id }, data: { name: text(body.name), contact: text(body.contact) || null, phone: text(body.phone) || null, address: text(body.address) || null, notes: text(body.notes) || null } });
    } else if (module === "customers") {
      updated = await db.customer.update({ where: { id }, data: { name: text(body.name), contact: text(body.contact) || null, phone: text(body.phone) || null, address: text(body.address) || null, notes: text(body.notes) || null, currency: text(body.currency) === "USD" ? "USD" : "TRY" } });
    } else return NextResponse.json({ error: "Bu modülde düzenleme henüz desteklenmiyor." }, { status: 400 });
    await db.auditLog.create({ data: { userId: user.id, action: "UPDATE", entity: module, entityId: id, metadata: JSON.parse(JSON.stringify(body)) } });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kayıt güncellenemedi. ID ve alanları kontrol edin." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ module: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const { module } = await context.params;
  const id = text(new URL(request.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Kayıt ID zorunlu." }, { status: 400 });
  try {
    if (module === "materials") {
      const [movementCount, requestCount, componentCount] = await Promise.all([
        db.stockMovement.count({ where: { materialId: id } }),
        db.materialRequest.count({ where: { materialId: id } }),
        db.productComponent.count({ where: { materialId: id } }),
      ]);
      if (movementCount || requestCount || componentCount) return NextResponse.json({ error: "Bu malzeme stok hareketi, talep veya ürün reçetesine bağlı olduğu için silinemez. Pasif yapmak daha güvenli." }, { status: 409 });
      await db.warehouseStock.deleteMany({ where: { materialId: id } });
      await db.materialPriceHistory.deleteMany({ where: { materialId: id } });
      await db.material.delete({ where: { id } });
    } else if (module === "products") await db.product.delete({ where: { id } });
    else if (module === "warehouses") await db.warehouse.delete({ where: { id } });
    else if (module === "factories") await db.factory.delete({ where: { id } });
    else if (module === "customers") await db.customer.delete({ where: { id } });
    else return NextResponse.json({ error: "Bu modülde silme henüz desteklenmiyor." }, { status: 400 });
    await db.auditLog.create({ data: { userId: user.id, action: "DELETE", entity: module, entityId: id } });
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kayıt silinemedi. Bağlı kayıtları kontrol edin." }, { status: 400 });
  }
}
