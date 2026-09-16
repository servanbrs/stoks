import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDashboardData } from "@/lib/dashboard";
import { sessionCookie, verifySession } from "@/lib/session";

export const runtime = "nodejs";

async function authed() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return false;
  try { await verifySession(token); return true; } catch { return false; }
}

export async function GET() {
  if (!await authed()) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  try {
    return NextResponse.json(await getDashboardData());
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Dashboard verisi alınamadı." }, { status: 500 });
  }
}
