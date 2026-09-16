import { PrismaClient } from "@prisma/client";

function prismaDatasourceUrl() {
  const configuredUrl = process.env.DATABASE_URL;
  if (!configuredUrl) return configuredUrl;

  // Hostinger's MySQL account uses sha256_password. When local development
  // reaches it through the SSH tunnel, Prisma must negotiate TLS first.
  try {
    const url = new URL(configuredUrl);
    if ((url.hostname === "127.0.0.1" || url.hostname === "localhost") && url.port === "13306" && !url.searchParams.has("sslaccept")) {
      url.searchParams.set("sslaccept", "accept_invalid_certs");
      return url.toString();
    }
  } catch {
    // Prisma will return the normal configuration error for an invalid URL.
  }

  return configuredUrl;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: prismaDatasourceUrl() });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
