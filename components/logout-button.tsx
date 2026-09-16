"use client";

import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  async function logout() { setLoading(true); await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }
  return <button type="button" onClick={() => void logout()} disabled={loading} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-line px-3 py-2.5 text-xs text-muted transition hover:border-danger/50 hover:text-danger disabled:opacity-50">{loading ? "Çıkış yapılıyor..." : "↪ Çıkış yap"}</button>;
}
