import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { demoCreate, demoList, isDemoMode } from "@/lib/demo-store";
import { sessionCookie, verifySession } from "@/lib/session";
import { ShipmentStatus } from "@prisma/client";
export const runtime = "nodejs";
async function user() { const token = (await cookies()).get(sessionCookie)?.value; if (!token) return null; try { const session = await verifySession(token); if (isDemoMode()) return { id: "local-demo-admin" }; return await db.user.findUnique({ where: { email: session.email }, select: { id: true } }); } catch { return null; } }
function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
export async function GET() { if (!await user()) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 }); if (isDemoMode()) return NextResponse.json(await demoList("shipments")); return NextResponse.json(await db.shipment.findMany({ orderBy: { createdAt: "desc" } })); }
export async function POST(request: NextRequest) { const current = await user(); if (!current) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 }); const body = await request.json() as Record<string, unknown>; const fromName = text(body.fromName), toName = text(body.toName), itemSummary = text(body.itemSummary); const quantity = Number(body.quantity); if (!fromName || !toName || !itemSummary || !Number.isFinite(quantity) || quantity <= 0) return NextResponse.json({ error: "Depo, fabrika, içerik ve geçerli miktar zorunlu." }, { status: 400 }); const data = { shipmentNo: `SEV-${Date.now().toString(36).toUpperCase()}`, fromName, toName, itemSummary, quantity, status: ShipmentStatus.PREPARING, notes: text(body.notes) || null }; if (isDemoMode()) return NextResponse.json(await demoCreate("shipments", data), { status: 201 }); return NextResponse.json(await db.shipment.create({ data }), { status: 201 }); }
