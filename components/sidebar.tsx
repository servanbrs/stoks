"use client";

import Link from "next/link";
import { navigation } from "@/lib/navigation";
import { LogoutButton } from "@/components/logout-button";

type Role =
  | "ADMIN"
  | "WAREHOUSE"
  | "PRODUCTION"
  | "ACCOUNTING"
  | "SALES"
  | "FACTORY";

const rolePaths: Record<Role, string[]> = {
  ADMIN: [],
  WAREHOUSE: [
    "/",
    "/operations",
    "/shipments",
    "/deliveries",
    "/stock-movements",
    "/materials",
    "/products",
    "/warehouses",
    "/requests",
  ],
  PRODUCTION: [
    "/",
    "/operations",
    "/shipments",
    "/deliveries",
    "/materials",
    "/products",
  ],
  ACCOUNTING: [
    "/",
    "/operations",
    "/orders",
    "/stock-movements",
    "/materials",
    "/products",
    "/warehouses",
    "/requests",
    "/customers",
    "/factories",
    "/finance",
    "/invoices",
    "/activity",
  ],
  SALES: [
    "/",
    "/orders",
    "/customers",
    "/products",
    "/invoices",
    "/sales",
    "/influencers",
  ],
  FACTORY: ["/", "/operations", "/shipments", "/deliveries"],
};

export function Sidebar({ role }: { role: Role | null }) {
  const allowed = role ? rolePaths[role] : [];

  return (
    <aside className="w-[260px] shrink-0 border-r border-line bg-[#0d1118] px-4 py-5 max-[900px]:w-full max-[900px]:border-r-0 max-[900px]:border-b">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-sm font-black text-black">
          S
        </div>

        <div>
          <div className="text-sm font-semibold text-white">Stoks</div>
          <div className="text-[10px] text-[#667180]">
            Operasyon Merkezi
          </div>
        </div>
      </div>

      <nav className="space-y-5">
        {navigation.map((section, index) => {
          const visibleItems = section.items.filter(
            (item) =>
              !role ||
              allowed.length === 0 ||
              allowed.includes(item.href),
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label ?? `section-${index}`}>
              {section.label && (
                <div className="mb-2 px-3">
                  <div className="text-[10px] font-bold tracking-[.16em] text-[#8994a3]">
                    {section.label}
                  </div>

                  {section.description && (
                    <div className="mt-1 text-[10px] text-[#566171]">
                      {section.description}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                {visibleItems.map((item, itemIndex) => (
                  <Link
                    key={item.href}
                    href={item.href as never}
                    className={
                      itemIndex === 0 && index === 0
                        ? "flex items-center gap-3 rounded-lg bg-[#202735] px-3 py-2.5 text-sm font-medium text-white"
                        : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition hover:bg-[#171e29] hover:text-white"
                    }
                  >
                    <span className="w-5 text-center text-accent">
                      {item.icon}
                    </span>

                    <span className="min-w-0">
                      <span className="block">{item.label}</span>

                      {item.description && (
                        <span className="hidden truncate text-[10px] text-[#596575] lg:block">
                          {item.description}
                        </span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="mt-8">
        <LogoutButton />
      </div>
    </aside>
  );
}