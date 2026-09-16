import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { demoList, isDemoMode } from "@/lib/demo-store";
import { sessionCookie, verifySession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  try {
    await verifySession(token);
    if (isDemoMode()) {
      const [warehouses, materials, shipments, productionJobs] = await Promise.all([demoList("warehouses"), demoList("materials"), demoList("shipments"), demoList("production")]);
      return NextResponse.json(warehouses.map((warehouse) => ({ ...warehouse, stocks: materials.filter((item) => item.warehouseId === warehouse.id || item.id === "demo-material-valf").map((material) => ({ material, quantity: material.quantity ?? 0, unitCost: material.unitCost ?? 12.5, shelfCode: material.shelfCode ?? "Raf 03" })), shipments: shipments.filter((shipment) => shipment.fromName === warehouse.name || shipment.toName === warehouse.name), productionJobs: productionJobs.filter((job) => shipments.some((shipment) => shipment.toName === job.factoryName && (shipment.fromName === warehouse.name || shipment.toName === warehouse.name))) })));
    }
    const [warehouses, shipments, productionJobs] = await Promise.all([
      db.warehouse.findMany({ include: { stocks: { include: { material: true, product: true } } }, orderBy: { createdAt: "desc" } }),
      db.shipment.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
      db.productionJob.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    ]);
    return NextResponse.json(warehouses.map((warehouse) => ({ ...warehouse, shipments: shipments.filter((shipment) => shipment.fromName === warehouse.name || shipment.toName === warehouse.name), productionJobs: productionJobs.filter((job) => shipments.some((shipment) => shipment.toName === job.factoryName && (shipment.fromName === warehouse.name || shipment.toName === warehouse.name))) })));
  } catch {
    return NextResponse.json({ error: "Depolar alınamadı." }, { status: 503 });
  }
}
