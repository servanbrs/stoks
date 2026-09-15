import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sessionCookie, verifySession } from "@/lib/session";

export const runtime = "nodejs";

async function requireAdmin() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  try { const session = await verifySession(token); return session.role === "ADMIN" ? session : null; } catch { return null; }
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Bu işlem için admin yetkisi gerekli." }, { status: 403 });
  const users = await db.user.findMany({ select: { id: true, name: true, email: true, role: true, active: true, factoryId: true, createdAt: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Bu işlem için admin yetkisi gerekli." }, { status: 403 });
  const body = await request.json() as { name?: string; email?: string; password?: string; role?: string; factoryId?: string };
  const roles = ["ADMIN", "WAREHOUSE", "PRODUCTION", "ACCOUNTING", "SALES", "FACTORY"] as const;
  if (!body.name || !body.email || !body.password || body.password.length < 8 || !body.role || !roles.includes(body.role as typeof roles[number])) return NextResponse.json({ error: "Ad, e-posta, en az 8 karakterli şifre ve geçerli rol zorunlu." }, { status: 400 });
  try {
    const user = await db.user.create({ data: { name: body.name.trim(), email: body.email.trim().toLowerCase(), passwordHash: await bcrypt.hash(body.password, 12), role: body.role as typeof roles[number], factoryId: body.factoryId?.trim() || null }, select: { id: true, name: true, email: true, role: true, active: true, factoryId: true, createdAt: true } });
    return NextResponse.json(user, { status: 201 });
  } catch { return NextResponse.json({ error: "Bu e-posta zaten kayıtlı olabilir." }, { status: 409 }); }
}
