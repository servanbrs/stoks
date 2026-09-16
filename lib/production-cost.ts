import { db } from "@/lib/db";
import { getUsdTryQuote, toTry } from "@/lib/fx";

export type Shortage = { name: string; required: number; stock: number; unit: string };

export async function snapshotProductionJob(jobId: string, productId: string | null, quantity: number, factoryCost: number | null) {
  const usd = await getUsdTryQuote();
  const lines: Array<{ materialId: string | null; label: string; quantity: number; unitCost: number; currency: "TRY" | "USD"; exchangeRate: number; convertedAmount: number }> = [];
  const shortages: Shortage[] = [];
  if (productId) {
    const product = await db.product.findUnique({ where: { id: productId }, include: { components: { include: { material: { include: { stocks: true, prices: { orderBy: { validFrom: "desc" }, take: 1 } } } } } } });
    if (product) {
      for (const component of product.components) {
        const required = quantity * Number(component.quantity);
        const stock = component.material.stocks.reduce((sum, row) => sum + Number(row.quantity), 0);
        if (stock < required) shortages.push({ name: component.material.name, required, stock, unit: component.material.unit });
        const price = component.material.prices[0];
        const unitCost = price ? Number(price.amount) : Number(component.material.stocks.find((row) => row.unitCost)?.unitCost ?? 0);
        const currency = price?.currency ?? "TRY";
        const exchangeRate = price ? Number(price.exchangeRate) : usd.rate;
        const convertedAmount = toTry(unitCost * required, currency, exchangeRate);
        lines.push({ materialId: component.materialId, label: component.material.name, quantity: required, unitCost, currency, exchangeRate, convertedAmount });
      }
    }
  }
  if (factoryCost && factoryCost > 0) {
    lines.push({ materialId: null, label: "Fason işçilik", quantity, unitCost: factoryCost, currency: "TRY", exchangeRate: usd.rate, convertedAmount: factoryCost * quantity });
  }
  if (lines.length > 0) {
    await db.productionCostSnapshot.createMany({ data: lines.map((line) => ({ productionJobId: jobId, ...line })) });
  }
  const missingNotes = shortages.length ? `Üretim için eksik malzeme var: ${shortages.map((item) => `${item.name} (gerekli ${item.required} ${item.unit}, mevcut ${item.stock})`).join("; ")}` : null;
  if (missingNotes) await db.productionJob.update({ where: { id: jobId }, data: { missingNotes } });
  return { ready: shortages.length === 0, shortages, costLines: lines };
}
