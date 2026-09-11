import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json() as { name?: string; email?: string; password?: string };
  if (!body.name || !body.email || !body.password || body.password.length < 8) return NextResponse.json({ error: "Ad, e-posta ve en az 8 karakterli şifre zorunlu." }, { status: 400 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL tanımlı değil." }, { status: 503 });
  if (await db.user.count() > 0) return NextResponse.json({ error: "İlk admin hesabı zaten oluşturulmuş." }, { status: 409 });
  const user = await db.user.create({ data: { name: body.name.trim(), email: body.email.trim().toLowerCase(), passwordHash: await bcrypt.hash(body.password, 12), role: "ADMIN" } });
  return NextResponse.json({ ok: true, email: user.email });
}
