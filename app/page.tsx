import { cookies } from "next/headers";
import { LoginPage } from "@/app/login/login-page";
import { DashboardView } from "@/components/dashboard-view";
import { sessionCookie, verifySession } from "@/lib/session";

export default async function HomePage() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (token) { try { await verifySession(token); return <DashboardView />; } catch { /* Login below */ } }
  return <LoginPage />;
}
