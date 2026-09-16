import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { sessionCookie, verifySession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  try {
    const session = await verifySession(token);
    await db.user.findUniqueOrThrow({ where: { email: session.email }, select: { id: true } });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.type.startsWith("image/")) return NextResponse.json({ error: "Geçerli bir görsel seçin." }, { status: 400 });
    if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "Görsel 12 MB'dan küçük olmalı." }, { status: 400 });
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const filename = `sales-${Date.now().toString(36)}-${crypto.randomUUID()}.${extension}`;
    const directory = path.join(process.cwd(), "public", "uploads", "sales");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ path: `/uploads/sales/${filename}`, name: file.name });
  } catch {
    return NextResponse.json({ error: "Görsel yüklenemedi." }, { status: 400 });
  }
}
