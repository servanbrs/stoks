import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json({ configured: false, connected: false, tablesReady: false, message: "DATABASE_URL bulunamadı." });
  try {
    await db.$queryRawUnsafe("SELECT 1");
    try {
      const userCount = await db.user.count();
      return NextResponse.json({ configured: true, connected: true, tablesReady: true, userCount, message: "MySQL bağlantısı ve tablolar hazır." });
    } catch {
      return NextResponse.json({ configured: true, connected: true, tablesReady: false, message: "MySQL bağlantısı başarılı ancak tablolar henüz oluşturulmamış." });
    }
  } catch {
    return NextResponse.json({ configured: true, connected: false, tablesReady: false, message: "MySQL bağlantısı kurulamadı. DATABASE_URL ve uzak bağlantı ayarlarını kontrol edin." });
  }
}
