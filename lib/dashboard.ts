import { db } from "@/lib/db";
import { demoList, isDemoMode } from "@/lib/demo-store";
import { getUsdTryQuote, toTry } from "@/lib/fx";

export type UrgentItem = { href: string; label: string; detail: string; tone: "danger" | "accent" };
export type DashboardData = {
  usdTry: { rate: number; source: string; capturedAt: string };
  totals: { orders: number; production: number; shipments: number; critical: number };
  stock: { materialQty: number; materialValueTry: number; productValueTry: number; totalTry: number; totalUsd: number };
  criticals: Array<{ id: string; name: string; stock: number; minimum: number; critical: number }>;
  urgents: UrgentItem[];
  activity: Array<{ id: string; title: string; at: string }>;
  demo: boolean;
};

function num(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }

export async function getDashboardData(): Promise<DashboardData> {
  const usdTry = await getUsdTryQuote();
  if (isDemoMode()) {
    const [orders, production, shipments, materials, products, requests, activity, movements] = await Promise.all([
      demoList("orders"), demoList("production"), demoList("shipments"), demoList("materials"),
      demoList("products"), demoList("requests"), demoList("activity"), demoList("stock-movements"),
    ]);
    const criticals = materials.filter((item) => num(item.quantity) <= num(item.criticalStock || item.minimumStock)).map((item) => ({
      id: item.id, name: String(item.name), stock: num(item.quantity), minimum: num(item.minimumStock), critical: num(item.criticalStock),
    }));
    const materialValueTry = materials.reduce((sum, item) => sum + num(item.quantity) * num(item.unitCost || 1), 0);
    const productValueTry = products.reduce((sum, item) => sum + num(item.salePrice || 0), 0);
    const urgents: UrgentItem[] = [
      ...criticals.map((item) => ({ href: "/materials", label: `${item.name} kritik stokta`, detail: `Mevcut ${item.stock} · min ${item.minimum}`, tone: "danger" as const })),
      ...requests.filter((item) => ["REQUESTED", "APPROVED"].includes(String(item.status))).map((item) => ({ href: "/requests", label: `${String((item.material as { name?: string } | undefined)?.name ?? "Malzeme")} talebi bekliyor`, detail: `${item.requestNo ?? ""} · ${item.quantity} ${item.unit ?? ""}`, tone: "accent" as const })),
      ...orders.filter((item) => ["NEW", "PREPARING", "READY"].includes(String(item.status))).map((item) => ({ href: "/orders", label: `${String(item.orderNo)} hazırlanmalı`, detail: String((item.customer as { name?: string } | undefined)?.name ?? item.status), tone: "accent" as const })),
      ...shipments.filter((item) => ["PREPARING", "IN_TRANSIT"].includes(String(item.status))).map((item) => ({ href: "/shipments", label: `${String(item.shipmentNo)} teslim bekliyor`, detail: `${item.fromName} → ${item.toName}`, tone: "accent" as const })),
    ];
    return {
      usdTry, demo: true,
      totals: { orders: orders.length, production: production.filter((item) => item.status === "IN_PROGRESS").length, shipments: shipments.filter((item) => item.status !== "DELIVERED").length, critical: criticals.length },
      stock: { materialQty: materials.reduce((sum, item) => sum + num(item.quantity), 0), materialValueTry, productValueTry, totalTry: materialValueTry + productValueTry, totalUsd: (materialValueTry + productValueTry) / usdTry.rate },
      criticals, urgents: urgents.slice(0, 8),
      activity: [...activity, ...movements].slice(0, 8).map((item) => ({ id: item.id, title: String(item.metadata && typeof item.metadata === "object" && "message" in item.metadata ? (item.metadata as { message: string }).message : item.description ?? item.action ?? item.type ?? "Hareket"), at: String(item.createdAt ?? "") })),
    };
  }

  const [orders, production, shipments, materials, productStocks, requests, activity] = await Promise.all([
    db.customerOrder.count({ where: { status: { not: "CANCELLED" } } }),
    db.productionJob.count({ where: { status: "IN_PROGRESS" } }),
    db.shipment.count({ where: { status: { notIn: ["DELIVERED", "CANCELLED"] } } }),
    db.material.findMany({ include: { stocks: true, prices: { orderBy: { validFrom: "desc" }, take: 1 } } }),
    db.warehouseStock.findMany({ where: { productId: { not: null } }, include: { product: true } }),
    db.materialRequest.findMany({ where: { status: { in: ["REQUESTED", "APPROVED", "ORDERED"] } }, include: { material: true }, take: 20, orderBy: { createdAt: "desc" } }),
    db.auditLog.findMany({ include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const criticals = materials.map((material) => {
    const stock = material.stocks.reduce((sum, row) => sum + Number(row.quantity), 0);
    return { id: material.id, name: material.name, stock, minimum: Number(material.minimumStock), critical: Number(material.criticalStock) };
  }).filter((item) => item.stock <= item.critical || item.stock <= item.minimum);

  const materialValueTry = materials.reduce((sum, material) => {
    const qty = material.stocks.reduce((total, row) => total + Number(row.quantity), 0);
    const price = material.prices[0];
    const unit = price ? Number(price.convertedAmount) : material.stocks.find((row) => row.unitCost)?.unitCost ? Number(material.stocks.find((row) => row.unitCost)!.unitCost) : 0;
    const currency = price?.currency ?? "TRY";
    const rate = price ? Number(price.exchangeRate) : usdTry.rate;
    return sum + toTry(qty * unit, currency === "USD" && !price ? "USD" : "TRY", rate);
  }, 0);
  const productValueTry = productStocks.reduce((sum, row) => {
    const price = Number(row.product?.salePrice ?? row.unitCost ?? 0);
    return sum + toTry(Number(row.quantity) * price, row.product?.currency ?? "TRY", usdTry.rate);
  }, 0);

  const openOrders = await db.customerOrder.findMany({ where: { status: { in: ["NEW", "CONFIRMED", "STOCK_CHECK", "PREPARING", "READY"] } }, include: { customer: true }, take: 8, orderBy: { createdAt: "desc" } });
  const openShipments = await db.shipment.findMany({ where: { status: { in: ["PREPARING", "IN_TRANSIT"] } }, take: 8, orderBy: { createdAt: "desc" } });

  const urgents: UrgentItem[] = [
    ...criticals.map((item) => ({ href: "/materials", label: `${item.name} kritik stokta`, detail: `Mevcut ${item.stock} · min ${item.minimum}`, tone: "danger" as const })),
    ...requests.map((item) => ({ href: "/requests", label: `${item.material.name} talebi açık`, detail: `${item.requestNo} · ${Number(item.quantity)} ${item.unit}`, tone: "accent" as const })),
    ...openOrders.map((item) => ({ href: "/orders", label: `${item.orderNo} hazırlanmalı`, detail: `${item.customer.name} · ${item.status}`, tone: "accent" as const })),
    ...openShipments.map((item) => ({ href: "/shipments", label: `${item.shipmentNo} teslim bekliyor`, detail: `${item.fromName} → ${item.toName}`, tone: "accent" as const })),
  ];

  return {
    usdTry, demo: false,
    totals: { orders, production, shipments, critical: criticals.length },
    stock: {
      materialQty: materials.reduce((sum, material) => sum + material.stocks.reduce((total, row) => total + Number(row.quantity), 0), 0),
      materialValueTry, productValueTry, totalTry: materialValueTry + productValueTry, totalUsd: (materialValueTry + productValueTry) / usdTry.rate,
    },
    criticals, urgents: urgents.slice(0, 10),
    activity: activity.map((item) => ({ id: item.id, title: `${item.user?.name ?? "Sistem"} · ${item.action} ${item.entity}`, at: item.createdAt.toISOString() })),
  };
}
