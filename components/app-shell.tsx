"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Assistant } from "@/components/assistant";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  if (pathname === "/login") return <main className="min-h-screen">{children}</main>;
  return <div className="app-shell"><Sidebar /><main className="min-w-0 flex-1">{children}</main><Assistant /></div>;
}
