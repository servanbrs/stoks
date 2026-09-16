import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { demoCreate, demoList, isDemoMode } from "@/lib/demo-store";
import { sessionCookie, verifySession } from "@/lib/session";

export const runtime = "nodejs";
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const number = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : NaN; };

async function auth() { const token = (await cookies()).get(sessionCookie)?.value; if (!token) return false; try { await verifySession(token); return true; } catch { return false; } }

export async function GET() {
  if (!await auth()) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  if (isDemoMode()) return NextResponse.json(await demoList("products"));
  return NextResponse.json(await db.product.findMany({ include: { components: { include: { material: true } } }, orderBy: { createdAt: "desc" } }));
}

export async function POST(request: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const body = await request.json() as Record<string, unknown>; const name = text(body.name), sku = text(body.sku); const components = Array.isArray(body.components) ? body.components as Array<Record<string, unknown>> : [];
  if (!name || !sku) return NextResponse.json({ error: "Ürün adı ve SKU zorunlu." }, { status: 400 });
  const cleanComponents = components.filter((component) => text(component.materialId) && Number.isFinite(number(component.quantity)) && number(component.quantity) > 0).map((component) => ({ materialId: text(component.materialId), quantity: number(component.quantity) }));
  if (isDemoMode()) return NextResponse.json(await demoCreate("products", { name, sku, brand: text(body.brand) || null, salePrice: Number.isFinite(number(body.salePrice)) ? number(body.salePrice) : null, currency: text(body.currency) === "USD" ? "USD" : "TRY", components: cleanComponents }), { status: 201 });
  try {
    const product = await db.product.create({ data: { name, sku, brand: text(body.brand) || null, salePrice: Number.isFinite(number(body.salePrice)) ? number(body.salePrice) : null, currency: text(body.currency) === "USD" ? "USD" : "TRY", components: { create: cleanComponents } }, include: { components: { include: { material: true } } } });
    return NextResponse.json(product, { status: 201 });
  } catch { return NextResponse.json({ error: "Ürün oluşturulamadı. SKU benzersiz olmalı." }, { status: 400 }); }
}
