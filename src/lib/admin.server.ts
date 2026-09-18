import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type AdminSession = { unlocked?: boolean };

export class ConfigError extends Error {
  override name = "ConfigError";
}

function sessionSecret() {
  const secret = process.env["SESSION_SECRET"];
  if (!secret || secret.length < 32) {
    throw new ConfigError(
      "SESSION_SECRET manquant ou trop court (32 caractères minimum) côté serveur.",
    );
  }
  return secret;
}

function config() {
  return {
    password: sessionSecret(),
    name: "esd-admin",
    maxAge: 60 * 60 * 12,
    cookie: {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

export async function getAdminSession() {
  return useSession<AdminSession>(config());
}

export function adminPassword() {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected) throw new ConfigError("ADMIN_PASSWORD manquant côté serveur.");
  return expected;
}

export function passwordMatches(input: string, expected: string) {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session.data.unlocked) throw new Error("NON_AUTORISE");
  return session;
}
