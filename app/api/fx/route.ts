import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUsdTryQuote, listUsdTryHistory, setManualUsdTry } from "@/lib/fx";
import { sessionCookie, verifySession } from "@/lib/session";

export const runtime = "nodejs";

async function authed() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return false;
  try { await verifySession(token); return true; } catch { return false; }
}

export async function GET() {
  if (!await authed()) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const [current, history] = await Promise.all([getUsdTryQuote(), listUsdTryHistory()]);
  return NextResponse.json({ current, history });
}

export async function POST(request: NextRequest) {
  if (!await authed()) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const body = await request.json() as { rate?: unknown };
  const rate = Number(body.rate);
  try {
    const saved = await setManualUsdTry(rate);
    return NextResponse.json(saved, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Geçerli bir USD/TRY kuru girin." }, { status: 400 });
  }
}
