import { createServerFn } from "@tanstack/react-start";
import type { Order } from "./tshirt";

export type Failure = {
  ok: false;
  reason: "config" | "auth" | "password" | "db";
  message: string;
};
export type ActionResult<T = null> = { ok: true; data: T } | Failure;

function failure(error: unknown): Failure {
  const message = error instanceof Error ? error.message : String(error);
  if (message === "NON_AUTORISE") {
    return { ok: false, reason: "auth", message: "Session expirée, merci de vous reconnecter." };
  }
  if (error instanceof Error && error.name === "ConfigError") {
    return { ok: false, reason: "config", message };
  }
  if (message.includes("Missing Supabase environment variable")) {
    return {
      ok: false,
      reason: "config",
      message:
        "Variables Supabase manquantes côté serveur (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    };
  }
  return { ok: false, reason: "db", message };
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }): Promise<ActionResult> => {
    try {
      const { adminPassword, getAdminSession, passwordMatches } = await import("./admin.server");
      const expected = adminPassword();
      if (!data.password || !passwordMatches(data.password, expected)) {
        return { ok: false, reason: "password", message: "Mot de passe incorrect." };
      }
      const session = await getAdminSession();
      await session.update({ unlocked: true });
      return { ok: true, data: null };
    } catch (error) {
      return failure(error);
    }
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { getAdminSession } = await import("./admin.server");
  const session = await getAdminSession();
  await session.clear();
  return { ok: true as const };
});

export const adminStatus = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const { getAdminSession } = await import("./admin.server");
    const session = await getAdminSession();
    return { unlocked: Boolean(session.data.unlocked), configError: null as string | null };
  } catch (error) {
    return { unlocked: false, configError: failure(error).message };
  }
});

export const listOrders = createServerFn({ method: "POST" }).handler(
  async (): Promise<ActionResult<Order[]>> => {
    try {
      const { requireAdmin } = await import("./admin.server");
      await requireAdmin();
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin
        .from("tshirt_orders")
        .select("id, group_slug, first_name, last_name, initials, size, created_at")
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return { ok: true, data: (data ?? []) as Order[] };
    } catch (error) {
      return failure(error);
    }
  },
);

export const updateOrder = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      id: string;
      group_slug: string;
      first_name: string;
      last_name: string;
      initials: string;
      size: string;
    }) => data,
  )
  .handler(async ({ data }): Promise<ActionResult> => {
    try {
      const { requireAdmin } = await import("./admin.server");
      await requireAdmin();
      if (!data.first_name.trim()) throw new Error("Le prénom est obligatoire.");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin
        .from("tshirt_orders")
        .update({
          group_slug: data.group_slug,
          first_name: data.first_name.trim().slice(0, 60),
          last_name: data.last_name.trim().slice(0, 60),
          initials: data.initials.trim().toUpperCase().slice(0, 4),
          size: data.size,
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, data: null };
    } catch (error) {
      return failure(error);
    }
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<ActionResult> => {
    try {
      const { requireAdmin } = await import("./admin.server");
      await requireAdmin();
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("tshirt_orders").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, data: null };
    } catch (error) {
      return failure(error);
    }
  });
