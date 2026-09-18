import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  adminLogin,
  adminLogout,
  adminStatus,
  deleteOrder,
  listOrders,
  updateOrder,
} from "@/lib/orders.functions";
import {
  ALL_SIZES,
  ADULT_SIZES,
  CHILD_SIZES,
  GROUPS,
  formatDate,
  groupLabel,
  type Order,
} from "@/lib/tshirt";
import { exportExcel, exportPdf } from "@/lib/exports";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Administration — Commandes t-shirts ES Doubs" },
      { name: "description", content: "Espace réservé au club : suivi des commandes de t-shirts." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Administration ES Doubs" },
      { property: "og:description", content: "Espace réservé au club." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const status = useQuery({ queryKey: ["admin-status"], queryFn: () => adminStatus() });

  if (status.isLoading) {
    return <p className="p-8 text-center text-muted-foreground">Chargement…</p>;
  }
  if (status.data?.configError) {
    return <ConfigErrorCard message={status.data.configError} />;
  }
  return status.data?.unlocked ? <Dashboard /> : <LoginCard />;
}

function ConfigErrorCard({ message }: { message: string }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <div className="rounded-xl border border-destructive bg-destructive/10 p-5">
        <h1 className="mb-2 font-display text-xl uppercase text-destructive">
          Configuration incomplète
        </h1>
        <p className="text-sm">{message}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Renseignez les variables <code>ADMIN_PASSWORD</code>, <code>SESSION_SECRET</code>,{" "}
          <code>SUPABASE_URL</code> et <code>SUPABASE_SERVICE_ROLE_KEY</code> côté serveur, puis
          rechargez cette page.
        </p>
      </div>
    </div>
  );
}

function LoginCard() {
  const qc = useQueryClient();
  const login = useServerFn(adminLogin);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await login({ data: { password: password.trim() } });
      if (res.ok) {
        qc.setQueryData(["admin-status"], { unlocked: true, configError: null });
        return;
      }
      setError(res.message);
    } catch {
      setError("La connexion a échoué. Merci de réessayer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <h1 className="mb-6 text-center font-display text-2xl uppercase text-secondary">
        Administration ES Doubs
      </h1>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          placeholder="Mot de passe"
          autoComplete="current-password"
          className="w-full rounded-xl border border-input px-4 py-4 text-lg"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          disabled={busy}
          className="rounded-xl bg-primary px-6 py-4 text-lg font-bold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

function Dashboard() {
  const qc = useQueryClient();
  const logout = useServerFn(adminLogout);
  const update = useServerFn(updateOrder);
  const remove = useServerFn(deleteOrder);

  const orders = useQuery({ queryKey: ["orders"], queryFn: () => listOrders() });
  const [groupFilter, setGroupFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Order | null>(null);

  const result = orders.data;
  const all = useMemo(() => (result?.ok ? result.data : []), [result]);
  const loadError = result && !result.ok ? result.message : null;

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return all.filter(
      (o) =>
        (groupFilter === "all" || o.group_slug === groupFilter) &&
        (sizeFilter === "all" || o.size === sizeFilter) &&
        (needle === "" ||
          o.first_name.toLowerCase().includes(needle) ||
          o.last_name.toLowerCase().includes(needle) ||
          o.initials.toLowerCase().includes(needle)),
    );
  }, [all, groupFilter, sizeFilter, search]);

  // Même enfant (groupe + prénom + initiales) enregistré avec des tailles différentes.
  const duplicates = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const o of all) {
      const key = `${o.group_slug}|${o.first_name.trim().toLowerCase()}|${o.initials.toUpperCase()}`;
      map.set(key, [...(map.get(key) ?? []), o]);
    }
    return [...map.values()].filter(
      (list) => list.length > 1 && new Set(list.map((o) => o.size)).size > 1,
    );
  }, [all]);

  const saveMutation = useMutation({
    mutationFn: (o: Order) =>
      update({
        data: {
          id: o.id,
          group_slug: o.group_slug,
          first_name: o.first_name,
          last_name: o.last_name,
          initials: o.initials,
          size: o.size,
        },
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      setEditing(null);
      toast.success("Demande mise à jour.");
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error("La modification a échoué."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Demande supprimée.");
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error("La suppression a échoué."),
  });

  function confirmDelete(order: Order) {
    if (confirm(`Supprimer la demande de ${order.first_name} (${order.size}) ?`)) {
      deleteMutation.mutate(order.id);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl uppercase text-secondary">
          Commandes t-shirts — Saison 2026/2027
        </h1>
        <button
          onClick={async () => {
            await logout({});
            qc.invalidateQueries({ queryKey: ["admin-status"] });
          }}
          className="rounded-lg border border-input px-4 py-2 text-sm font-semibold"
        >
          Se déconnecter
        </button>
      </div>

      {orders.isLoading && <p className="text-muted-foreground">Chargement des commandes…</p>}

      {loadError && (
        <p className="mb-6 rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          Impossible de charger les commandes : {loadError}
        </p>
      )}

      <section className="mb-8 rounded-xl border border-border p-5">
        <h2 className="mb-1 text-lg font-bold">📦 Récapitulatif commande</h2>
        <p className="mb-4 text-xl font-bold text-primary">Total : {all.length} t-shirts</p>
        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
          {ALL_SIZES.map((s) => (
            <div key={s} className="flex justify-between border-b border-border/60 py-1 text-sm">
              <span className="text-muted-foreground">{s}</span>
              <span className="font-semibold">{all.filter((o) => o.size === s).length}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => exportExcel(all)}
            disabled={all.length === 0}
            className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground disabled:opacity-50"
          >
            📊 Export Excel
          </button>
          <button
            onClick={() => exportPdf(all)}
            disabled={all.length === 0}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            🖨️ Export PDF
          </button>
        </div>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        {GROUPS.map((g) => {
          const list = all.filter((o) => o.group_slug === g.slug);
          const sizes = ALL_SIZES.filter((s) => list.some((o) => o.size === s));
          return (
            <div key={g.slug} className="rounded-xl border border-border p-4">
              <h3 className="mb-2 font-bold">
                {g.label} — {list.length} enfants
              </h3>
              {sizes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune demande</p>
              ) : (
                sizes.map((s) => (
                  <div key={s} className="flex justify-between py-0.5 text-sm">
                    <span className="text-muted-foreground">{s}</span>
                    <span className="font-semibold">{list.filter((o) => o.size === s).length}</span>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </section>

      {duplicates.length > 0 && (
        <section className="mb-8 rounded-xl border border-accent bg-accent/15 p-4">
          <h2 className="mb-1 font-bold">⚠️ Doublons potentiels</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Même enfant enregistré avec des tailles différentes — supprimez la mauvaise entrée.
          </p>
          {duplicates.map((list) => (
            <div key={list[0]!.id} className="mb-3 rounded-lg bg-background/70 p-3">
              {list.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-1">
                  <span className="text-sm">
                    {o.first_name} {o.last_name} — {groupLabel(o.group_slug)} — {o.initials} —{" "}
                    {o.size} — {formatDate(o.created_at)}
                  </span>
                  <button
                    onClick={() => confirmDelete(o)}
                    className="rounded border border-destructive px-2 py-1 text-xs text-destructive"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              ))}
            </div>
          ))}
        </section>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="rounded-lg border border-input px-3 py-2 text-sm"
        >
          <option value="all">Groupe : Tous</option>
          {GROUPS.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.label}
            </option>
          ))}
        </select>
        <select
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          className="rounded-lg border border-input px-3 py-2 text-sm"
        >
          <option value="all">Taille : Toutes</option>
          {ALL_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔎 Rechercher un prénom, un nom ou des initiales"
          className="flex-1 rounded-lg border border-input px-3 py-2 text-sm"
        />
      </div>

      <p className="mb-2 text-sm text-muted-foreground">
        {filtered.length} demande{filtered.length > 1 ? "s" : ""} affichée
        {filtered.length > 1 ? "s" : ""}
      </p>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <Th>Groupe</Th>
              <Th>Prénom</Th>
              <Th>Nom</Th>
              <Th>Initiales</Th>
              <Th>Taille</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <Td>{groupLabel(o.group_slug)}</Td>
                <Td>{o.first_name}</Td>
                <Td>{o.last_name}</Td>
                <Td>{o.initials}</Td>
                <Td>{o.size}</Td>
                <Td>{formatDate(o.created_at)}</Td>
                <Td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(o)}
                      className="rounded border border-input px-2 py-1 text-xs"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => confirmDelete(o)}
                      className="rounded border border-destructive px-2 py-1 text-xs text-destructive"
                    >
                      🗑️
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && !orders.isLoading && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  Aucune demande pour ces filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-card p-5">
            <h3 className="mb-4 text-lg font-bold">Modifier la demande</h3>
            <div className="flex flex-col gap-3">
              <select
                value={editing.group_slug}
                onChange={(e) => setEditing({ ...editing, group_slug: e.target.value })}
                className="rounded-lg border border-input px-3 py-2"
              >
                {GROUPS.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.label}
                  </option>
                ))}
              </select>
              <input
                value={editing.first_name}
                onChange={(e) => setEditing({ ...editing, first_name: e.target.value })}
                placeholder="Prénom"
                className="rounded-lg border border-input px-3 py-2"
              />
              <input
                value={editing.last_name}
                onChange={(e) => setEditing({ ...editing, last_name: e.target.value })}
                placeholder="Nom"
                className="rounded-lg border border-input px-3 py-2"
              />
              <input
                value={editing.initials}
                onChange={(e) =>
                  setEditing({ ...editing, initials: e.target.value.toUpperCase().slice(0, 4) })
                }
                placeholder="Initiales"
                className="rounded-lg border border-input px-3 py-2 uppercase"
              />
              <select
                value={editing.size}
                onChange={(e) => setEditing({ ...editing, size: e.target.value })}
                className="rounded-lg border border-input px-3 py-2"
              >
                <optgroup label="ENFANT">
                  {CHILD_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="ADULTE">
                  {ADULT_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => saveMutation.mutate(editing)}
                disabled={saveMutation.isPending || !editing.first_name.trim()}
                className="flex-1 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saveMutation.isPending ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="flex-1 rounded-lg border border-input px-4 py-2 font-semibold"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left font-semibold">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2">{children}</td>;
}
