import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { demoCreate, demoList, demoUpdate, isDemoMode } from "@/lib/demo-store";
import { sessionCookie, verifySession } from "@/lib/session";

export const runtime = "nodejs";
type Role = "ADMIN" | "WAREHOUSE" | "PRODUCTION" | "ACCOUNTING" | "SALES" | "FACTORY";
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const number = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : NaN; };
const code = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

async function currentUser() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  try {
    const session = await verifySession(token);
    if (isDemoMode()) return { id: "local-demo-admin", role: "ADMIN" as Role, factoryId: null };
    return await db.user.findUnique({ where: { email: session.email }, select: { id: true, role: true, factoryId: true } });
  } catch { return null; }
}

async function overview(): Promise<Record<string, unknown>> {
  if (isDemoMode()) {
    const [orders, materials, production, requests, shipments, products] = await Promise.all([demoList("orders"), demoList("materials"), demoList("production"), demoList("requests"), demoList("shipments"), demoList("products")]);
    const requirements = new Map<string, { materialId: string; name: string; unit: string; required: number; stock: number; shortage: number; orders: string[] }>();
    for (const order of orders) for (const line of Array.isArray(order.items) ? order.items as Array<Record<string, unknown>> : []) { const product = products.find((item) => item.id === line.productId); for (const component of Array.isArray(product?.components) ? product.components as Array<Record<string, unknown>> : []) { const material = materials.find((item) => item.id === component.materialId); if (!material) continue; const current = requirements.get(String(component.materialId)) ?? { materialId: String(component.materialId), name: String(material.name), unit: String(material.unit ?? "adet"), required: 0, stock: Number(material.quantity ?? 0), shortage: 0, orders: [] }; current.required += Number(line.quantity ?? 0) * Number(component.quantity ?? 0); current.shortage = Math.max(0, current.required - current.stock); if (!current.orders.includes(String(order.orderNo))) current.orders.push(String(order.orderNo)); requirements.set(String(component.materialId), current); } }
    return { orders, materials, production, requests, shipments, products, requirements: [...requirements.values()], generatedAt: new Date().toISOString(), demo: true };
  }
  const [orders, materials, production, requests, shipments, products] = await Promise.all([
    db.customerOrder.findMany({ where: { status: { not: "CANCELLED" } }, include: { customer: true, items: { include: { product: { include: { components: { include: { material: true } } } } } } }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.material.findMany({ include: { stocks: true }, orderBy: { name: "asc" } }),
    db.productionJob.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.materialRequest.findMany({ include: { material: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.shipment.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.product.findMany({ include: { components: { include: { material: true } } }, orderBy: { name: "asc" } }),
  ]);
  const required = new Map<string, { materialId: string; name: string; unit: string; required: number; stock: number; shortage: number; orders: string[] }>();
  for (const order of orders) for (const line of order.items) for (const component of line.product.components) {
    const current = required.get(component.materialId) ?? { materialId: component.materialId, name: component.material.name, unit: component.material.unit, required: 0, stock: materials.find((material) => material.id === component.materialId)?.stocks.reduce((sum, stock) => sum + Number(stock.quantity), 0) ?? 0, shortage: 0, orders: [] };
    current.required += Number(line.quantity) * Number(component.quantity); current.shortage = Math.max(0, current.required - current.stock); if (!current.orders.includes(order.orderNo)) current.orders.push(order.orderNo); required.set(component.materialId, current);
  }
  return { orders, materials, production, requests, shipments, products, requirements: [...required.values()], generatedAt: new Date().toISOString(), demo: false };
}

export async function GET() { const user = await currentUser(); if (!user) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 }); const result = await overview(); if (user.role === "FACTORY") { const production = Array.isArray(result.production) ? result.production as Array<Record<string, unknown>> : []; result.production = production.filter((job) => job.factoryId === user.factoryId || (user.factoryId && job.factoryName === user.factoryId)); } return NextResponse.json(result); }

export async function POST(request: NextRequest) {
  const user = await currentUser(); if (!user) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const body = await request.json() as Record<string, unknown>; const action = text(body.action);
  if (action === "create-request") {
    const materialId = text(body.materialId), quantity = number(body.quantity); if (!materialId || !Number.isFinite(quantity) || quantity <= 0) return NextResponse.json({ error: "Malzeme ve miktar zorunlu." }, { status: 400 });
    if (isDemoMode()) return NextResponse.json(await demoCreate("requests", { requestNo: code("TLP"), materialId, quantity, unit: text(body.unit) || "adet", status: "REQUESTED", notes: text(body.notes) || null }));
    return NextResponse.json(await db.materialRequest.create({ data: { requestNo: code("TLP"), materialId, requestedById: user.id, quantity, unit: text(body.unit) || "adet", notes: text(body.notes) || null } }), { status: 201 });
  }
  if (action === "create-job") {
    if (!["ADMIN", "ACCOUNTING", "PRODUCTION"].includes(user.role)) return NextResponse.json({ error: "Bu rol üretim işi oluşturamaz." }, { status: 403 });
    const title = text(body.title), quantity = number(body.quantity); if (!title || !Number.isFinite(quantity) || quantity <= 0) return NextResponse.json({ error: "İş adı ve miktar zorunlu." }, { status: 400 });
    const data = { jobNo: code("URE"), title, orderId: text(body.orderId) || null, productId: text(body.productId) || null, factoryId: text(body.factoryId) || null, factoryName: text(body.factoryName) || null, quantity, costPerUnit: Number.isFinite(number(body.costPerUnit)) ? number(body.costPerUnit) : null, status: "QUEUED" as const, notes: text(body.notes) || null };
    if (isDemoMode()) return NextResponse.json(await demoCreate("production", data), { status: 201 });
    return NextResponse.json(await db.productionJob.create({ data }), { status: 201 });
  }
  if (action === "update-job") {
    const id = text(body.id), status = text(body.status); if (!id || !["QUEUED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) return NextResponse.json({ error: "İş ve durum zorunlu." }, { status: 400 });
    if (user.role === "FACTORY" && !["IN_PROGRESS", "COMPLETED"].includes(status)) return NextResponse.json({ error: "Fabrika bu duruma geçemez." }, { status: 403 });
    const data = { status, missingNotes: text(body.missingNotes) || null, ...(status === "IN_PROGRESS" ? { acceptedAt: new Date() } : {}), ...(status === "COMPLETED" ? { completedAt: new Date(), deliveredAt: new Date() } : {}) };
    if (isDemoMode()) return NextResponse.json(await demoUpdate("production", id, data));
    return NextResponse.json(await db.productionJob.update({ where: { id }, data: { status: status as "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED", missingNotes: data.missingNotes, acceptedAt: data.acceptedAt, completedAt: data.completedAt, deliveredAt: data.deliveredAt } }));
  }
  return NextResponse.json({ error: "Geçersiz operasyon işlemi." }, { status: 400 });
}
