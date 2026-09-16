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
    return await db.user.findUnique({ where: { email: session.email }, select: { id: true, role: true } });
  } catch { return null; }
}

function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }

export async function GET() {
  if (!await currentUser()) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const [assets, campaigns, leads, emails] = await Promise.all([
    db.salesAsset.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.salesCampaign.findMany({ orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }], take: 50 }),
    db.salesLead.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.salesEmail.findMany({ include: { lead: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return NextResponse.json({ assets, campaigns, leads, emails });
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const action = text(body.action);
  try {
    if (action === "asset") {
      const title = text(body.title);
      if (!title) return NextResponse.json({ error: "Görsel adı zorunlu." }, { status: 400 });
      const asset = await db.salesAsset.create({ data: {
        title,
        productId: text(body.productId) || null,
        sourceImagePath: text(body.sourceImagePath) || null,
        prompt: text(body.prompt) || null,
        status: "QUEUED",
        createdById: user.id,
      } });
      return NextResponse.json(asset, { status: 201 });
    }
    if (action === "campaign") {
      const name = text(body.name), channel = text(body.channel);
      if (!name || !channel) return NextResponse.json({ error: "Kampanya adı ve kanal zorunlu." }, { status: 400 });
      const campaign = await db.salesCampaign.create({ data: {
        name, channel, caption: text(body.caption) || null, targetUrl: text(body.targetUrl) || null,
        assetId: text(body.assetId) || null, scheduledAt: text(body.scheduledAt) ? new Date(text(body.scheduledAt)) : null,
        status: text(body.scheduledAt) ? "SCHEDULED" : "DRAFT", createdById: user.id,
      } });
      return NextResponse.json(campaign, { status: 201 });
    }
    if (action === "lead") {
      const fullName = text(body.fullName);
      if (!fullName) return NextResponse.json({ error: "Ad soyad veya firma adı zorunlu." }, { status: 400 });
      const lead = await db.salesLead.create({ data: {
        fullName, company: text(body.company) || null, email: text(body.email) || null,
        phone: text(body.phone) || null, source: text(body.source) || null, sourceUrl: text(body.sourceUrl) || null,
        consentStatus: text(body.consentStatus) || "UNKNOWN", notes: text(body.notes) || null,
      } });
      return NextResponse.json(lead, { status: 201 });
    }
    if (action === "email") {
      const leadId = text(body.leadId), subject = text(body.subject), emailBody = text(body.body);
      if (!leadId || !subject || !emailBody) return NextResponse.json({ error: "Lead, konu ve e-posta metni zorunlu." }, { status: 400 });
      const email = await db.salesEmail.create({ data: {
        leadId, subject, body: emailBody, scheduledAt: text(body.scheduledAt) ? new Date(text(body.scheduledAt)) : null,
        status: text(body.scheduledAt) ? "SCHEDULED" : "DRAFT", createdById: user.id,
      } });
      return NextResponse.json(email, { status: 201 });
    }
    return NextResponse.json({ error: "Geçersiz satış işlemi." }, { status: 400 });
  } catch (error) {
    console.error("Sales operation error", error);
    return NextResponse.json({ error: "Satış kaydı oluşturulamadı. Alanları kontrol edin." }, { status: 400 });
  }
}
