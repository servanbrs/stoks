"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Assistant } from "@/components/assistant";

type Role = "ADMIN" | "WAREHOUSE" | "PRODUCTION" | "ACCOUNTING" | "SALES" | "FACTORY";
export function AppShell({ children, role }: Readonly<{ children: React.ReactNode; role: Role | null }>) {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/setup") return <main className="min-h-screen">{children}</main>;
  return <div className="app-shell"><Sidebar role={role} /><main className="min-w-0 flex-1">{children}</main><Assistant /></div>;
}
