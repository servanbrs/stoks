import { NextResponse } from "next/server";
import { createSession, sessionCookie } from "@/lib/session";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json() as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!email || !password) return NextResponse.json({ error: "E-posta ve şifre zorunlu." }, { status: 400 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "MySQL bağlantısı bulunamadı. Local .env dosyasına DATABASE_URL ekleyin." }, { status: 503 });
  try {
    const user = await db.user.findUnique({ where: { email }, select: { email: true, passwordHash: true, role: true, active: true } });
    if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
    const role = user.role === "FACTORY" ? "FACTORY" : "ADMIN";
    const token = await createSession(user.email, role);
    const response = NextResponse.json({ ok: true, role });
    response.cookies.set(sessionCookie, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/" });
    return response;
  } catch (error) {
    console.error("Login database error", error);
    return NextResponse.json({ error: "MySQL bağlantısı kurulamadı. DATABASE_URL ve veritabanı tablolarını kontrol edin." }, { status: 503 });
  }
}
