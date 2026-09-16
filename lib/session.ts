import { SignJWT, jwtVerify } from "jose";

export const sessionCookie = "stoks_session";

export type UserRole =
  | "ADMIN"
  | "WAREHOUSE"
  | "PRODUCTION"
  | "ACCOUNTING"
  | "SALES"
  | "FACTORY";

function secret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "local-development-secret-change-me",
  );
}

export async function createSession(email: string, role: UserRole) {
  return new SignJWT({ email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}

export async function verifySession(token: string) {
  const result = await jwtVerify(token, secret());

  return result.payload as {
    email: string;
    role: UserRole;
  };
}