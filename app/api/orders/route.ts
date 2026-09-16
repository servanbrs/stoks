import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { demoCreate, demoList, isDemoMode } from "@/lib/demo-store";
import { sessionCookie, verifySession } from "@/lib/session";

export const runtime = "nodejs";
type OrderItemInput = { productId?: string; quantity?: number | string; unitPrice?: number | string };

async function currentUser() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  try {
    const session = await verifySession(token);
    if (isDemoMode()) return { id: "local-demo-admin", role: "ADMIN" as const };
    return await db.user.findUnique({ where: { email: session.email }, select: { id: true, role: true } });
  } catch { return null; }
}
function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function amount(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) && parsed > 0 ? parsed : 0; }

export async function GET() {
  if (!await currentUser()) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  if (isDemoMode()) return NextResponse.json(await demoList("orders"));
  return NextResponse.json(await db.customerOrder.findMany({ include: { customer: true, items: { include: { product: true } } }, orderBy: { createdAt: "desc" } }));
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const body = await request.json() as { customerId?: string; currency?: string; notes?: string; items?: OrderItemInput[] };
  const customerId = text(body.customerId);
  const items = (body.items ?? []).map((item) => ({ productId: text(item.productId), quantity: amount(item.quantity), unitPrice: amount(item.unitPrice) })).filter((item) => item.productId && item.quantity > 0 && item.unitPrice > 0);
  if (!customerId || items.length === 0) return NextResponse.json({ error: "Müşteri ve en az bir ürün, miktar ve fiyat zorunlu." }, { status: 400 });
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  try {
    if (isDemoMode()) {
      const customers = await demoList("customers"); const products = await demoList("products");
      const customer = customers.find((item) => item.id === customerId) ?? { name: "Demo müşteri" };
      const enrichedItems = items.map((item) => ({ ...item, product: products.find((product) => product.id === item.productId) ?? { name: item.productId } }));
      return NextResponse.json(await demoCreate("orders", { orderNo: `SIP-DEMO-${Date.now().toString(36).toUpperCase()}`, customerId, customer, items: enrichedItems, total, currency: body.currency === "USD" ? "USD" : "TRY", status: "NEW", notes: text(body.notes) || null }), { status: 201 });
    }
    const order = await db.customerOrder.create({ data: { orderNo: `SIP-${Date.now().toString(36).toUpperCase()}`, customerId, createdById: user.id, currency: body.currency === "USD" ? "USD" : "TRY", total, status: "NEW", items: { create: items } }, include: { customer: true, items: { include: { product: true } } } });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order create error", error);
    return NextResponse.json({ error: "Sipariş oluşturulamadı. Müşteri ve ürün kayıtlarını kontrol edin." }, { status: 400 });
  }
}
