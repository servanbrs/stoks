import { db } from "@/lib/db";
import { demoCreate, demoList, isDemoMode } from "@/lib/demo-store";

export type FxQuote = { pair: "USDTRY"; rate: number; source: string; capturedAt: string };

const FALLBACK_RATE = Number(process.env.USD_TRY_RATE || 40);
const FRESH_MS = 6 * 60 * 60 * 1000;

function quote(rate: number, source: string, capturedAt = new Date().toISOString()): FxQuote {
  return { pair: "USDTRY", rate, source, capturedAt };
}

async function fetchLiveUsdTry(): Promise<FxQuote | null> {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store", signal: AbortSignal.timeout(4000) });
    if (!response.ok) return null;
    const body = await response.json() as { rates?: { TRY?: number } };
    const rate = Number(body.rates?.TRY);
    return Number.isFinite(rate) && rate > 0 ? quote(rate, "er-api") : null;
  } catch {
    return null;
  }
}

async function latestStored(): Promise<FxQuote | null> {
  if (isDemoMode()) {
    const list = await demoList("exchangeRates");
    const item = list[0];
    if (!item) return null;
    const rate = Number(item.rate);
    if (!Number.isFinite(rate) || rate <= 0) return null;
    return quote(rate, String(item.source ?? "manual"), String(item.capturedAt ?? item.createdAt ?? new Date().toISOString()));
  }
  try {
    const item = await db.exchangeRate.findFirst({ where: { pair: "USDTRY" }, orderBy: { capturedAt: "desc" } });
    if (!item) return null;
    return quote(Number(item.rate), item.source, item.capturedAt.toISOString());
  } catch {
    return null;
  }
}

async function persist(live: FxQuote) {
  try {
    if (isDemoMode()) await demoCreate("exchangeRates", live);
    else await db.exchangeRate.create({ data: { pair: live.pair, rate: live.rate, source: live.source, capturedAt: new Date(live.capturedAt) } });
  } catch {
    // Dashboard should still work if persistence fails.
  }
}

export async function getUsdTryQuote(): Promise<FxQuote> {
  const stored = await latestStored();
  if (stored && Date.now() - new Date(stored.capturedAt).getTime() < FRESH_MS) return stored;
  const live = await fetchLiveUsdTry();
  if (live) {
    await persist(live);
    return live;
  }
  if (stored) return { ...stored, source: `${stored.source}/cached` };
  return quote(FALLBACK_RATE, "fallback");
}

export async function listUsdTryHistory(limit = 30) {
  if (isDemoMode()) return (await demoList("exchangeRates")).slice(0, limit);
  try {
    return await db.exchangeRate.findMany({ where: { pair: "USDTRY" }, orderBy: { capturedAt: "desc" }, take: limit });
  } catch {
    return [];
  }
}

export async function setManualUsdTry(rate: number) {
  if (!Number.isFinite(rate) || rate <= 0) throw new Error("Geçerli bir kur girin.");
  const capturedAt = new Date();
  if (isDemoMode()) return demoCreate("exchangeRates", quote(rate, "manual", capturedAt.toISOString()));
  return db.exchangeRate.create({ data: { pair: "USDTRY", rate, source: "manual", capturedAt } });
}

export function toTry(amount: number, currency: string, exchangeRate: number) {
  return currency === "USD" ? amount * exchangeRate : amount;
}
