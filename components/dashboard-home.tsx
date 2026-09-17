"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Box,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Factory,
  Package,
  RefreshCw,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Warehouse,
  Activity,
  CircleDot,
} from "lucide-react";

type Role =
  | "ADMIN"
  | "WAREHOUSE"
  | "PRODUCTION"
  | "ACCOUNTING"
  | "SALES"
  | "FACTORY";

type ProductionJob = {
  id: string;
  jobNo?: string;
  title?: string;
  factoryId?: string | null;
  factoryName?: string | null;
  quantity?: number;
  status?: string;
  createdAt?: string;
  acceptedAt?: string | null;
  completedAt?: string | null;
  deliveredAt?: string | null;
  missingNotes?: string | null;
};

type Order = {
  id: string;
  orderNo?: string;
  status?: string;
  total?: number;
  currency?: string;
  customer?: {
    name?: string;
  } | null;
  createdAt?: string;
  items?: Array<{
    quantity?: number;
    product?: {
      name?: string;
    } | null;
  }>;
};

type Shipment = {
  id: string;
  shipmentNo?: string;
  fromName?: string;
  toName?: string;
  itemSummary?: string;
  quantity?: number;
  status?: string;
  createdAt?: string;
  deliveredAt?: string | null;
};

type Requirement = {
  materialId: string;
  name: string;
  unit: string;
  required: number;
  stock: number;
  shortage: number;
  orders?: string[];
};

type OperationResponse = {
  orders?: Order[];
  production?: ProductionJob[];
  shipments?: Shipment[];
  requirements?: Requirement[];
  generatedAt?: string;
  demo?: boolean;
};

const statusLabels: Record<string, string> = {
  QUEUED: "Bekliyor",
  IN_PROGRESS: "Üretimde",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
  PREPARING: "Hazırlanıyor",
  IN_TRANSIT: "Yolda",
  DELIVERED: "Teslim edildi",
  NEW: "Yeni",
  PROCESSING: "İşleniyor",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

function statusLabel(status?: string) {
  if (!status) return "Bilinmiyor";
  return statusLabels[status] ?? status;
}

function statusClass(status?: string) {
  switch (status) {
    case "IN_PROGRESS":
    case "IN_TRANSIT":
      return "bg-accent/10 text-accent border-accent/20";

    case "COMPLETED":
    case "DELIVERED":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

    case "CANCELLED":
      return "bg-red-500/10 text-red-400 border-red-500/20";

    case "PREPARING":
    case "QUEUED":
    case "NEW":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";

    default:
      return "bg-white/5 text-muted border-line";
  }
}

function AnimatedNumber({
  value,
  duration = 0.8,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{formatNumber(display)}</>;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = false,
  warning = false,
  delay = 0,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  accent?: boolean;
  warning?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="card group relative overflow-hidden p-5"
    >
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100 ${
          accent
            ? "bg-accent/10 opacity-70"
            : warning
              ? "bg-amber-500/10 opacity-60"
              : "bg-white/5 opacity-40"
        }`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <div className="eyebrow">{title}</div>

          <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
            <AnimatedNumber value={value} />
          </div>

          <div className="mt-2 text-xs text-muted">{description}</div>
        </div>

        <div
          className={`grid h-10 w-10 place-items-center rounded-xl border ${
            accent
              ? "border-accent/20 bg-accent/10 text-accent"
              : warning
                ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                : "border-line bg-white/[0.03] text-muted"
          }`}
        >
          <Icon size={18} />
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-white/[0.03] text-muted">
        <Icon size={20} />
      </div>

      <div className="mt-4 text-sm font-medium text-white">{title}</div>

      <div className="mt-2 max-w-sm text-xs leading-5 text-muted">
        {text}
      </div>
    </div>
  );
}

export function DashboardHome({ role }: { role: Role }) {
  const [data, setData] = useState<OperationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/operations", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Dashboard verileri alınamadı.");
      }

      const result = (await response.json()) as OperationResponse;

      setData(result);
    } catch (err) {
      console.error(err);
      setError("Dashboard verileri yüklenemedi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadDashboard();

    const interval = window.setInterval(() => {
      void loadDashboard(true);
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const orders = data?.orders ?? [];
  const production = data?.production ?? [];
  const shipments = data?.shipments ?? [];
  const requirements = data?.requirements ?? [];

  const stats = useMemo(() => {
    const activeProduction = production.filter(
      (job) =>
        job.status === "QUEUED" ||
        job.status === "IN_PROGRESS",
    );

    const pendingShipments = shipments.filter(
      (shipment) =>
        shipment.status !== "DELIVERED" &&
        shipment.status !== "CANCELLED",
    );

    const criticalStock = requirements.filter(
      (item) => Number(item.shortage ?? 0) > 0,
    );

    return {
      totalOrders: orders.length,
      activeProduction: activeProduction.length,
      pendingShipments: pendingShipments.length,
      criticalStock: criticalStock.length,
    };
  }, [orders, production, shipments, requirements]);

  const recentProduction = useMemo(
    () =>
      [...production]
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        )
        .slice(0, 6),
    [production],
  );

  const recentShipments = useMemo(
    () =>
      [...shipments]
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        )
        .slice(0, 6),
    [shipments],
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        )
        .slice(0, 5),
    [orders],
  );

  const criticalRequirements = useMemo(
    () =>
      [...requirements]
        .filter((item) => Number(item.shortage ?? 0) > 0)
        .sort((a, b) => Number(b.shortage) - Number(a.shortage))
        .slice(0, 6),
    [requirements],
  );

  const factorySummary = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        active: number;
        completed: number;
        total: number;
      }
    >();

    for (const job of production) {
      const name = job.factoryName || "Fabrika belirtilmemiş";

      const current = map.get(name) ?? {
        name,
        active: 0,
        completed: 0,
        total: 0,
      };

      current.total += 1;

      if (
        job.status === "QUEUED" ||
        job.status === "IN_PROGRESS"
      ) {
        current.active += 1;
      }

      if (job.status === "COMPLETED") {
        current.completed += 1;
      }

      map.set(name, current);
    }

    return [...map.values()].sort(
      (a, b) => b.active - a.active,
    );
  }, [production]);

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-6 lg:px-10">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-8">
            <div className="h-3 w-32 animate-pulse rounded bg-white/5" />
            <div className="mt-4 h-9 w-72 animate-pulse rounded bg-white/5" />
            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-white/5" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="card h-32 animate-pulse bg-white/[0.015]"
              />
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="card h-[430px] animate-pulse bg-white/[0.015]" />
            <div className="card h-[430px] animate-pulse bg-white/[0.015]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-6 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1800px]">
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <div className="eyebrow mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_currentColor]" />
              OPERASYON MERKEZİ
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
              Genel Bakış
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-muted">
              Fabrika, üretim, sipariş, stok ve teslimat operasyonlarını
              tek ekrandan takip edin.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-white/[0.03] px-4 text-xs font-medium text-white transition hover:bg-white/[0.06] disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
            Yenile
          </button>
        </motion.header>

        {/* ERROR */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300"
            >
              <AlertTriangle size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATS */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="TOPLAM SİPARİŞ"
            value={stats.totalOrders}
            description="Sistemdeki aktif siparişler"
            icon={ShoppingCart}
            delay={0.05}
          />

          <StatCard
            title="ÜRETİMDE"
            value={stats.activeProduction}
            description="Bekleyen ve devam eden işler"
            icon={Factory}
            accent
            delay={0.1}
          />

          <StatCard
            title="BEKLEYEN TESLİMAT"
            value={stats.pendingShipments}
            description="Henüz tamamlanmamış sevkiyatlar"
            icon={Truck}
            delay={0.15}
          />

          <StatCard
            title="KRİTİK STOK"
            value={stats.criticalStock}
            description={
              stats.criticalStock > 0
                ? "Eksik malzeme bulunan kalemler"
                : "Kritik seviyede malzeme yok"
            }
            icon={AlertTriangle}
            warning={stats.criticalStock > 0}
            delay={0.2}
          />
        </section>

        {/* MAIN GRID */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
          {/* FACTORY OPERATIONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="card overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <div className="eyebrow">FABRİKA OPERASYONLARI</div>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Üretimdeki işler
                </h2>
              </div>

              <div className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white/[0.03] text-muted">
                <Factory size={16} />
              </div>
            </div>

            {recentProduction.length === 0 ? (
              <EmptyState
                icon={Factory}
                title="Aktif üretim bulunmuyor"
                text="Yeni bir üretim işi oluşturulduğunda fabrika operasyonları burada görünecek."
              />
            ) : (
              <div className="divide-y divide-line">
                {recentProduction.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.3 + index * 0.05,
                    }}
                    className="group flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.025]"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.03] text-muted">
                      {job.status === "IN_PROGRESS" ? (
                        <Activity
                          size={17}
                          className="text-accent"
                        />
                      ) : job.status === "COMPLETED" ? (
                        <CheckCircle2
                          size={17}
                          className="text-emerald-400"
                        />
                      ) : (
                        <Clock3 size={17} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-white">
                          {job.title || "Üretim işi"}
                        </span>

                        <span className="text-[10px] text-muted">
                          {job.jobNo || "-"}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span>
                          {job.factoryName || "Fabrika belirtilmemiş"}
                        </span>

                        <span className="text-white/20">•</span>

                        <span>
                          {formatNumber(Number(job.quantity ?? 0))} adet
                        </span>

                        <span className="text-white/20">•</span>

                        <span>{formatDate(job.createdAt)}</span>
                      </div>
                    </div>

                    <span
                      className={`hidden shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium sm:inline-flex ${statusClass(
                        job.status,
                      )}`}
                    >
                      {statusLabel(job.status)}
                    </span>

                    <ChevronRight
                      size={15}
                      className="text-muted opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* FACTORY SUMMARY */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="card overflow-hidden"
          >
            <div className="border-b border-line px-5 py-4">
              <div className="eyebrow">FABRİKALAR</div>

              <h2 className="mt-1 text-lg font-semibold text-white">
                İş yoğunluğu
              </h2>
            </div>

            {factorySummary.length === 0 ? (
              <EmptyState
                icon={Warehouse}
                title="Fabrika verisi yok"
                text="Üretim işleri fabrikalara atandığında burada özetlenecek."
              />
            ) : (
              <div className="space-y-3 p-5">
                {factorySummary.slice(0, 6).map((factory, index) => {
                  const percentage =
                    factory.total > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (factory.active / factory.total) * 100,
                          ),
                        )
                      : 0;

                  return (
                    <motion.div
                      key={factory.name}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.35 + index * 0.05,
                      }}
                      className="rounded-xl border border-line bg-white/[0.02] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-muted">
                            <Factory size={15} />
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-white">
                              {factory.name}
                            </div>

                            <div className="mt-0.5 text-[11px] text-muted">
                              {factory.completed} tamamlandı ·{" "}
                              {factory.total} toplam
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold text-accent">
                            {factory.active}
                          </div>
                          <div className="text-[10px] text-muted">
                            aktif
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{
                            duration: 0.8,
                            delay: 0.4 + index * 0.05,
                          }}
                          className="h-full rounded-full bg-accent"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </section>

        {/* DELIVERY + ORDERS */}
        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          {/* SHIPMENTS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="card overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <div className="eyebrow">SEVKİYAT & TESLİMAT</div>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Son teslimatlar
                </h2>
              </div>

              <Truck size={17} className="text-muted" />
            </div>

            {recentShipments.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="Henüz sevkiyat yok"
                text="Depodan fabrikaya veya müşteriye yapılan sevkiyatlar burada görünecek."
              />
            ) : (
              <div className="divide-y divide-line">
                {recentShipments.map((shipment, index) => (
                  <motion.div
                    key={shipment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.4 + index * 0.05,
                    }}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.03]">
                      <Package size={16} className="text-muted" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {shipment.shipmentNo || "Sevkiyat"}
                        </span>
                      </div>

                      <div className="mt-1 truncate text-xs text-muted">
                        {shipment.fromName || "-"}{" "}
                        <span className="mx-1 text-white/20">→</span>{" "}
                        {shipment.toName || "-"}
                      </div>

                      <div className="mt-1 truncate text-[11px] text-muted">
                        {shipment.itemSummary || "İçerik belirtilmemiş"}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusClass(
                          shipment.status,
                        )}`}
                      >
                        {statusLabel(shipment.status)}
                      </span>

                      <div className="mt-1 text-[10px] text-muted">
                        {formatDate(shipment.createdAt)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ORDERS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="card overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <div className="eyebrow">SİPARİŞLER</div>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Son siparişler
                </h2>
              </div>

              <ShoppingCart size={17} className="text-muted" />
            </div>

            {recentOrders.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="Henüz sipariş yok"
                text="Müşteri siparişleri oluşturulduğunda burada listelenecek."
              />
            ) : (
              <div className="divide-y divide-line">
                {recentOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.45 + index * 0.05,
                    }}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.03]">
                      <CircleDot
                        size={16}
                        className="text-accent"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white">
                        {order.orderNo || "Sipariş"}
                      </div>

                      <div className="mt-1 truncate text-xs text-muted">
                        {order.customer?.name ||
                          "Müşteri belirtilmemiş"}
                      </div>

                      <div className="mt-1 text-[11px] text-muted">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {new Intl.NumberFormat("tr-TR", {
                          style: "currency",
                          currency:
                            order.currency === "USD"
                              ? "USD"
                              : "TRY",
                          maximumFractionDigits: 0,
                        }).format(Number(order.total ?? 0))}
                      </div>

                      <span
                        className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] ${statusClass(
                          order.status,
                        )}`}
                      >
                        {statusLabel(order.status)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </section>

        {/* CRITICAL STOCK */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="card mt-6 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <div className="eyebrow">STOK KONTROLÜ</div>

              <h2 className="mt-1 text-lg font-semibold text-white">
                Kritik malzemeler
              </h2>
            </div>

            <div
              className={`grid h-9 w-9 place-items-center rounded-lg border ${
                criticalRequirements.length
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                  : "border-line bg-white/[0.03] text-muted"
              }`}
            >
              <Box size={16} />
            </div>
          </div>

          {criticalRequirements.length === 0 ? (
            <div className="flex items-center gap-4 px-5 py-7">
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <div className="text-sm font-medium text-white">
                  Kritik stok bulunmuyor
                </div>

                <div className="mt-1 text-xs text-muted">
                  Mevcut siparişlere göre hesaplanan malzeme
                  ihtiyaçlarında açık görünmüyor.
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {criticalRequirements.map((item, index) => (
                <motion.div
                  key={item.materialId}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.5 + index * 0.05,
                  }}
                  className="rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">
                        {item.name}
                      </div>

                      <div className="mt-1 text-[11px] text-muted">
                        Gereken:{" "}
                        {formatNumber(
                          Number(item.required ?? 0),
                        )}{" "}
                        {item.unit}
                      </div>
                    </div>

                    <AlertTriangle
                      size={16}
                      className="shrink-0 text-amber-400"
                    />
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted">
                        Mevcut
                      </div>

                      <div className="mt-1 text-sm font-semibold text-white">
                        {formatNumber(
                          Number(item.stock ?? 0),
                        )}{" "}
                        {item.unit}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-muted">
                        Eksik
                      </div>

                      <div className="mt-1 text-sm font-semibold text-amber-400">
                        {formatNumber(
                          Number(item.shortage ?? 0),
                        )}{" "}
                        {item.unit}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* FOOTER STATUS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-5 flex flex-col gap-2 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
            Sistem aktif
          </div>

          <div className="flex items-center gap-2">
            <span>
              {data?.demo
                ? "Demo veri modu"
                : "Canlı veritabanı"}
            </span>

            <span className="text-white/20">•</span>

            <span>
              Son güncelleme{" "}
              {formatDate(data?.generatedAt)}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}