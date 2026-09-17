import { cookies } from "next/headers";
import { LoginPage } from "@/app/login/login-page";
import { sessionCookie, verifySession } from "@/lib/session";
import { DashboardHome } from "@/components/dashboard-home";

export default async function HomePage() {
  const token = (await cookies()).get(sessionCookie)?.value;

  if (token) {
    try {
      const session = await verifySession(token);

      return <DashboardHome role={session.role} />;
    } catch {
      // Oturum geçersizse login göster
    }
  }

  return <LoginPage />;
}