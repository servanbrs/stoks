import { NextResponse } from "next/server";
import { createSession, sessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json() as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const adminEmail = (process.env.DEMO_ADMIN_EMAIL ?? "admin@example.local").toLowerCase();
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD ?? "demo1234";
  const factoryEmail = (process.env.DEMO_FACTORY_EMAIL ?? "fabrika1@example.local").toLowerCase();
  const factoryPassword = process.env.DEMO_FACTORY_PASSWORD ?? "demo1234";
  const role = email === adminEmail && password === adminPassword ? "ADMIN" : email === factoryEmail && password === factoryPassword ? "FACTORY" : null;
  if (!email || !role) return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  const token = await createSession(email, role);
  const response = NextResponse.json({ ok: true, role });
  response.cookies.set(sessionCookie, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/" });
  return response;
}
