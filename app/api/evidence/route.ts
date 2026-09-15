import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { sessionCookie, verifySession } from "@/lib/session";

export const runtime = "nodejs";

async function currentUser() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  try { const session = await verifySession(token); return await db.user.findUnique({ where: { email: session.email }, select: { id: true } }); } catch { return null; }
}

export async function GET(request: NextRequest) {
  if (!await currentUser()) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const relatedId = request.nextUrl.searchParams.get("relatedId");
  return NextResponse.json(await db.evidencePhoto.findMany({ where: relatedId ? { relatedId } : undefined, include: { uploadedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } }));
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const form = await request.formData(); const file = form.get("file"); const stage = String(form.get("stage") || ""); const relatedType = String(form.get("relatedType") || "manual"); const relatedId = String(form.get("relatedId") || "manual");
  if (!(file instanceof File) || !file.type.startsWith("image/")) return NextResponse.json({ error: "Geçerli bir fotoğraf seçin." }, { status: 400 });
  if (!["SHIPMENT", "FACTORY_RECEIPT", "PRODUCTION_DELIVERY", "WAREHOUSE_RECEIPT"].includes(stage)) return NextResponse.json({ error: "Teslimat adımı geçersiz." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Fotoğraf en fazla 8 MB olabilir." }, { status: 400 });
  const extension = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg"; const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads"); await mkdir(uploadDir, { recursive: true }); await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json(await db.evidencePhoto.create({ data: { stage: stage as "SHIPMENT" | "FACTORY_RECEIPT" | "PRODUCTION_DELIVERY" | "WAREHOUSE_RECEIPT", fileName: file.name, storagePath: `/uploads/${filename}`, mimeType: file.type, size: file.size, uploadedById: user.id, relatedType, relatedId } }), { status: 201 });
}
