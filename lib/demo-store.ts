import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type DemoItem = Record<string, unknown> & { id: string; createdAt?: string; updatedAt?: string };
type DemoState = Record<string, DemoItem[]>;
const statePath = path.join(process.cwd(), ".local-demo-data.json");

export function isDemoMode() { return process.env.NODE_ENV !== "production" && existsSync(path.join(process.cwd(), ".local-demo")); }
const seed: DemoState = {
  materials: [{ id: "demo-material-valf", name: "Pirinç valf", sku: "MLZ-VALF-001", category: "Valf", unit: "adet", minimumStock: 500, criticalStock: 150, supplier: "Demo Tedarikçi", quantity: 2400, locationCode: "D1-A-03", shelfCode: "Raf 03", createdAt: "2026-09-16" }],
  products: [{ id: "demo-product-parfum", name: "Noir Essence 50 ml", sku: "URN-NOIR-050", brand: "Stoks Demo", salePrice: 850, currency: "TRY", createdAt: "2026-09-16" }],
  warehouses: [{ id: "demo-warehouse-main", name: "Merkez Demo Depo", active: true, createdAt: "2026-09-16" }],
  factories: [{ id: "demo-factory-1", name: "Demo Üretim Fabrikası", contact: "Ayşe Demir", phone: "0212 000 00 00", active: true, createdAt: "2026-09-16" }],
  customers: [{ id: "demo-customer-1", name: "Demo Kozmetik Mağazası", contact: "Mert Kaya", email: "demo@example.com", phone: "0532 000 00 00", currency: "TRY", createdAt: "2026-09-16" }],
  orders: [{ id: "demo-order-1", orderNo: "SIP-DEMO-001", customer: { name: "Demo Kozmetik Mağazası" }, status: "NEW", total: 12500, currency: "TRY", createdAt: "2026-09-16" }],
  production: [{ id: "demo-production-1", jobNo: "URE-DEMO-001", title: "Noir Essence demo üretimi", factoryName: "Demo Üretim Fabrikası", quantity: 300, status: "IN_PROGRESS", createdAt: "2026-09-16" }],
  shipments: [{ id: "demo-shipment-1", shipmentNo: "SEV-DEMO-001", fromName: "Merkez Demo Depo", toName: "Demo Üretim Fabrikası", itemSummary: "Valf + kapak", quantity: 300, status: "IN_TRANSIT", createdAt: "2026-09-16" }],
  finance: [{ id: "demo-payment-1", partyName: "Demo Tedarikçi", amount: 4500, currency: "TRY", direction: "PAYMENT", description: "Demo ödeme", createdAt: "2026-09-16" }],
  requests: [{ id: "demo-request-1", requestNo: "TLP-DEMO-001", material: { name: "Pirinç valf" }, quantity: 300, unit: "adet", status: "REQUESTED", createdAt: "2026-09-16" }],
  invoices: [{ id: "demo-invoice-1", invoiceNo: "FAT-DEMO-001", customer: { name: "Demo Kozmetik Mağazası" }, total: 12500, currency: "TRY", status: "DRAFT", issueDate: "2026-09-16" }],
  "stock-movements": [{ id: "demo-movement-1", type: "PURCHASE", material: { name: "Pirinç valf" }, quantity: 2400, description: "Demo başlangıç stoğu", createdAt: "2026-09-16" }],
  activity: [{ id: "demo-activity-1", action: "DEMO", entity: "SYSTEM", metadata: { message: "Demo mod aktif" }, createdAt: "2026-09-16" }],
  salesAssets: [{ id: "demo-asset-1", title: "Noir Essence sosyal medya görseli", status: "READY", prompt: "Lüks stüdyo çekimi demo kreatifi", createdAt: "2026-09-16" }],
  salesCampaigns: [{ id: "demo-campaign-1", name: "Sonbahar lansmanı", channel: "Instagram", status: "SCHEDULED", caption: "Yeni Noir Essence şimdi keşfet", scheduledAt: "2026-09-20T10:00:00.000Z", createdAt: "2026-09-16" }],
  salesLeads: [{ id: "demo-lead-1", fullName: "Demo Beauty Store", company: "Demo Beauty Store", email: "demo@example.com", source: "2018 İstanbul Kozmetik Fuarı", consentStatus: "PENDING", status: "NEW", createdAt: "2026-09-16" }],
  salesEmails: [{ id: "demo-email-1", subject: "Ürün iş birliği önerisi", body: "Demo e-posta taslağı", status: "DRAFT", lead: { fullName: "Demo Beauty Store" }, createdAt: "2026-09-16" }],
  influencerProfiles: [{ id: "demo-influencer-1", displayName: "Demo Kozmetik Creator", platform: "Instagram", handle: "@demo_creator", profileUrl: "https://example.com/demo-creator", niche: "Kozmetik", country: "Türkiye", followerCount: 18000, averageViews: 7200, productOnly: true, source: "Demo creator listesi", consentStatus: "PENDING", contactStatus: "NOT_CONTACTED", createdAt: "2026-09-16" }],
  influencerCollaborations: [{ id: "demo-collab-1", influencer: { displayName: "Demo Kozmetik Creator" }, offerType: "PRODUCT_ONLY", status: "CONTACTED", productQty: 1, deliverables: "1 Reels + 3 story", dueDate: "2026-09-25", createdAt: "2026-09-16" }],
};

async function readState(): Promise<DemoState> { try { return JSON.parse(await readFile(statePath, "utf8")) as DemoState; } catch { return structuredClone(seed); } }
async function writeState(state: DemoState) { await mkdir(path.dirname(statePath), { recursive: true }); await writeFile(statePath, JSON.stringify(state, null, 2)); }
export async function demoList(module: string) { const state = await readState(); return state[module] ?? []; }
export async function demoCreate(module: string, data: Record<string, unknown>) { const state = await readState(); const item = { ...data, id: `demo-${module}-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as DemoItem; state[module] = [item, ...(state[module] ?? [])]; await writeState(state); return item; }
export async function demoUpdate(module: string, id: string, data: Record<string, unknown>) { const state = await readState(); const list = state[module] ?? []; const index = list.findIndex((item) => item.id === id); if (index < 0) throw new Error("Demo kayıt bulunamadı"); const item = { ...list[index], ...data, id, updatedAt: new Date().toISOString() } as DemoItem; list[index] = item; state[module] = list; await writeState(state); return item; }
export async function demoDelete(module: string, id: string) { const state = await readState(); state[module] = (state[module] ?? []).filter((item) => item.id !== id); await writeState(state); return { ok: true, id }; }
