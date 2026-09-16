import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sessionCookie, verifySession } from "@/lib/session";

export const runtime = "nodejs";

async function currentUser() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  try {
    const session = await verifySession(token);
    return await db.user.findUnique({ where: { email: session.email }, select: { id: true } });
  } catch { return null; }
}
function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function integer(value: unknown) { const parsed = Number(value); return Number.isInteger(parsed) && parsed >= 0 ? parsed : null; }

export async function GET() {
  if (!await currentUser()) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const [profiles, collaborations] = await Promise.all([
    db.influencerProfile.findMany({ include: { collaborations: { orderBy: { createdAt: "desc" }, take: 10 } }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.influencerCollaboration.findMany({ include: { influencer: true }, orderBy: { createdAt: "desc" }, take: 200 }),
  ]);
  return NextResponse.json({ profiles, collaborations });
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const action = text(body.action);
  try {
    if (action === "profile") {
      const displayName = text(body.displayName), platform = text(body.platform);
      if (!displayName || !platform) return NextResponse.json({ error: "Ad ve platform zorunlu." }, { status: 400 });
      const profile = await db.influencerProfile.create({ data: {
        displayName, platform, handle: text(body.handle) || null, profileUrl: text(body.profileUrl) || null,
        niche: text(body.niche) || null, country: text(body.country) || null, followerCount: integer(body.followerCount), averageViews: integer(body.averageViews),
        engagementRate: body.engagementRate ? Number(body.engagementRate) : null, productOnly: body.productOnly !== false,
        email: text(body.email) || null, phone: text(body.phone) || null, source: text(body.source) || null,
        consentStatus: text(body.consentStatus) || "UNKNOWN", notes: text(body.notes) || null,
      } });
      return NextResponse.json(profile, { status: 201 });
    }
    if (action === "collaboration") {
      const influencerId = text(body.influencerId);
      if (!influencerId) return NextResponse.json({ error: "Influencer seçimi zorunlu." }, { status: 400 });
      const collaboration = await db.influencerCollaboration.create({ data: {
        influencerId, productId: text(body.productId) || null, offerType: text(body.offerType) || "PRODUCT_ONLY",
        status: text(body.status) || "DRAFT", deliverables: text(body.deliverables) || null, message: text(body.message) || null,
        productQty: body.productQty ? Number(body.productQty) : null, dueDate: text(body.dueDate) ? new Date(text(body.dueDate)) : null,
        createdById: user.id,
      } });
      return NextResponse.json(collaboration, { status: 201 });
    }
    if (action === "status") {
      const id = text(body.id), status = text(body.status);
      if (!id || !status) return NextResponse.json({ error: "Kayıt ve durum zorunlu." }, { status: 400 });
      const collaboration = await db.influencerCollaboration.update({ where: { id }, data: { status, contentUrl: text(body.contentUrl) || null, result: text(body.result) || null, shippedAt: status === "PRODUCT_SHIPPED" ? new Date() : undefined } });
      return NextResponse.json(collaboration);
    }
    return NextResponse.json({ error: "Geçersiz influencer işlemi." }, { status: 400 });
  } catch (error) {
    console.error("Influencer operation error", error);
    return NextResponse.json({ error: "Influencer kaydı oluşturulamadı." }, { status: 400 });
  }
}
