import type { Role } from "@prisma/client";

export type Capability =
  | "view_assigned_jobs"
  | "view_received_materials"
  | "view_delivery_history"
  | "view_factory_daily_log"
  | "accept_assigned_job"
  | "complete_assigned_job"
  | "report_missing_material"
  | "upload_job_evidence"
  | "view_payments"
  | "create_payments"
  | "manage_inventory"
  | "manage_users";

const factoryCapabilities: Capability[] = [
  "view_assigned_jobs",
  "view_received_materials",
  "view_delivery_history",
  "view_factory_daily_log",
  "accept_assigned_job",
  "complete_assigned_job",
  "report_missing_material",
  "upload_job_evidence",
];

const roleCapabilities: Record<Role, Capability[]> = {
  ADMIN: [
    "view_assigned_jobs", "view_received_materials", "view_delivery_history", "view_factory_daily_log",
    "accept_assigned_job", "complete_assigned_job", "report_missing_material", "upload_job_evidence",
    "view_payments", "create_payments", "manage_inventory", "manage_users",
  ],
  WAREHOUSE: ["view_received_materials", "view_delivery_history", "view_factory_daily_log", "upload_job_evidence", "manage_inventory"],
  PRODUCTION: ["view_assigned_jobs", "view_received_materials", "view_delivery_history", "view_factory_daily_log", "accept_assigned_job", "complete_assigned_job", "report_missing_material", "upload_job_evidence"],
  ACCOUNTING: ["view_payments", "create_payments", "view_delivery_history"],
  SALES: ["view_delivery_history"],
  FACTORY: factoryCapabilities,
};

export function hasCapability(role: Role, capability: Capability) {
  return roleCapabilities[role].includes(capability);
}

export function assertFactoryScope(role: Role, userFactoryId: string | null, requestedFactoryId: string) {
  if (role === "ADMIN" || role !== "FACTORY") return;
  if (!userFactoryId || userFactoryId !== requestedFactoryId) throw new Error("Bu fabrika kaydına erişim yetkiniz yok.");
}

export const factoryRoleRules = {
  canSee: ["assigned jobs", "received materials", "completed deliveries", "broken and missing quantities", "daily factory log"],
  canDo: ["accept assigned job", "complete assigned job", "report missing material", "upload evidence photos"],
  cannotDo: ["create payments", "edit customer ledgers", "view other factories", "change warehouse stock", "manage users", "create unrelated orders"],
} as const;
