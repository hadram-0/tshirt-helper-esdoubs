import { createServerFn } from "@tanstack/react-start";
import type { Order } from "./tshirt";

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const { getAdminSession, passwordMatches } = await import("./admin.server");
    const expected = process.env["ADMIN_PASSWORD"];
    if (!expected) throw new Error("ADMIN_PASSWORD manquant");
    if (!data.password || !passwordMatches(data.password, expected)) {
      return { ok: false as const };
    }
    const session = await getAdminSession();
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { getAdminSession } = await import("./admin.server");
  const session = await getAdminSession();
  await session.clear();
  return { ok: true as const };
});

export const adminStatus = createServerFn({ method: "POST" }).handler(async () => {
  const { getAdminSession } = await import("./admin.server");
  const session = await getAdminSession();
  return { unlocked: Boolean(session.data.unlocked) };
});

export const listOrders = createServerFn({ method: "POST" }).handler(async () => {
  const { requireAdmin } = await import("./admin.server");
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("tshirt_orders")
    .select("id, group_slug, first_name, last_name, initials, size, created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
});

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
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();
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
    return { ok: true as const };
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("tshirt_orders").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
