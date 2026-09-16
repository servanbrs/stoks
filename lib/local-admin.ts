import { readFile } from "node:fs/promises";
import path from "node:path";

type LocalAdmin = { email: string; password: string; name?: string };

export async function getLocalAdmin(): Promise<LocalAdmin | null> {
  if (process.env.NODE_ENV === "production") return null;
  try {
    const content = await readFile(path.join(process.cwd(), ".local-admin.json"), "utf8");
    const admin = JSON.parse(content) as LocalAdmin;
    return admin.email && admin.password ? admin : null;
  } catch { return null; }
}
