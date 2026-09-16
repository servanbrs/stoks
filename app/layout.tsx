import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { cookies } from "next/headers";
import { sessionCookie, verifySession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Stoks | Operasyon Merkezi",
  description: "Parfüm üretim, stok ve fason operasyon yönetimi",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let role: "ADMIN" | "WAREHOUSE" | "PRODUCTION" | "ACCOUNTING" | "SALES" | "FACTORY" | null = null;
  const token = (await cookies()).get(sessionCookie)?.value;
  if (token) { try { role = (await verifySession(token)).role; } catch { role = null; } }
  return (
    <html lang="tr">
      <body>
        <AppShell role={role}>{children}</AppShell>
      </body>
    </html>
  );
}
