import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ClubFooter, ClubHeader } from "@/components/ClubHeader";
import { supabase } from "@/integrations/supabase/client";
import { ADULT_SIZES, CHILD_SIZES, groupLabel, isGroupSlug } from "@/lib/tshirt";

export const Route = createFileRoute("/$group")({
  beforeLoad: ({ params }) => {
    if (!isGroupSlug(params.group)) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: `T-shirt ${groupLabel(params.group)} — ES Doubs 2026/2027` },
      {
        name: "description",
        content: `Renseignez le prénom, les initiales et la taille du t-shirt de votre enfant — groupe ${groupLabel(params.group)}.`,
      },
      { property: "og:title", content: `T-shirt ${groupLabel(params.group)} — ES Doubs` },
      {
        property: "og:description",
        content: "Formulaire t-shirt offert avec la licence ES Doubs 2026/2027.",
      },
    ],
  }),
  component: GroupPage,
});

type Step = "form" | "review" | "done";

function GroupPage() {
  const { group } = Route.useParams();
  const label = groupLabel(group);

  const [step, setStep] = useState<Step>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [initials, setInitials] = useState("");
  const [size, setSize] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ firstName: string; size: string } | null>(null);

  function goReview(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) return setError("Merci d'indiquer le prénom de l'enfant.");
    if (!lastName.trim()) return setError("Merci d'indiquer le nom de l'enfant.");
    if (!initials.trim()) return setError("Merci d'indiquer les initiales.");
    if (!size) return setError("Merci de choisir une taille.");
    setError(null);
    setStep("review");
  }

  async function confirm() {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from("tshirt_orders").insert({
      group_slug: group,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      initials: initials.trim().toUpperCase(),
      size,
    });
    setSaving(false);
    if (err) {
      setError("L'enregistrement a échoué. Merci de réessayer.");
      return;
    }
    setSaved({ firstName: firstName.trim(), size });
    setStep("done");
  }

  function reset() {
    setFirstName("");
    setLastName("");
    setInitials("");
    setSize("");
    setSaved(null);
    setError(null);
    setStep("form");
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-lg px-5">
      <ClubHeader subtitle={`👕 T-shirt — ${label}`} />

      {step === "form" && (
        <form onSubmit={goReview} className="flex flex-col gap-6">
          <p className="text-center text-base text-foreground">
            Merci de renseigner les informations de votre enfant.
          </p>

          <div>
            <label htmlFor="firstName" className="mb-2 block text-sm font-bold">
              1. Prénom de l'enfant
            </label>
            <input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              maxLength={60}
              required
              placeholder="Prénom"
              className="w-full rounded-xl border border-input bg-background px-4 py-4 text-lg outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="mb-2 block text-sm font-bold">
              2. Nom de l'enfant
            </label>
            <input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              maxLength={60}
              required
              placeholder="Nom"
              className="w-full rounded-xl border border-input bg-background px-4 py-4 text-lg outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <div>
            <label htmlFor="initials" className="mb-2 block text-sm font-bold">
              3. Initiales
            </label>
            <input
              id="initials"
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 4))}
              maxLength={4}
              required
              placeholder="XX"
              className="w-full rounded-xl border border-input bg-background px-4 py-4 text-lg uppercase tracking-widest outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
            <p className="mt-1 text-sm text-muted-foreground">Exemple : ND</p>
          </div>

          <div>
            <label htmlFor="size" className="mb-2 block text-sm font-bold">
              4. Taille du t-shirt
            </label>
            <select
              id="size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              required
              className="w-full rounded-xl border border-input bg-background px-4 py-4 text-lg outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
            >
              <option value="">Choisir une taille…</option>
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

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-6 py-5 text-lg font-bold text-primary-foreground shadow-sm active:scale-[0.98]"
          >
            Continuer
          </button>
          <Link to="/" className="text-center text-sm text-muted-foreground underline">
            Changer de groupe
          </Link>
        </form>
      )}

      {step === "review" && (
        <div className="flex flex-col gap-5">
          <h2 className="text-center text-xl font-bold">Vérifiez votre demande</h2>
          <dl className="rounded-xl border border-border bg-muted/40 p-5 text-base">
            <Row label="Groupe" value={label} />
            <Row label="Prénom" value={firstName.trim()} />
            <Row label="Nom" value={lastName.trim()} />
            <Row label="Initiales" value={initials.toUpperCase()} />
            <Row label="Taille" value={size} />
          </dl>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <button
            onClick={confirm}
            disabled={saving}
            className="w-full rounded-xl bg-primary px-6 py-5 text-lg font-bold text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "✅ Confirmer"}
          </button>
          <button
            onClick={() => setStep("form")}
            className="w-full rounded-xl border border-input px-6 py-4 text-base font-semibold"
          >
            ← Modifier
          </button>
        </div>
      )}

      {step === "done" && saved && (
        <div className="flex flex-col gap-5 text-center">
          <h2 className="text-2xl font-bold text-secondary">✅ Demande enregistrée</h2>
          <p className="text-base">
            Merci ! Les informations pour le t-shirt de <strong>{saved.firstName}</strong> ont bien
            été enregistrées.
          </p>
          <p className="rounded-xl bg-secondary px-4 py-4 text-lg font-bold text-secondary-foreground">
            {label} — {saved.size}
          </p>
          <p className="text-sm text-muted-foreground">Vous pouvez fermer cette page.</p>
          <button
            onClick={reset}
            className="w-full rounded-xl border border-input px-6 py-4 text-base font-semibold"
          >
            ➕ Ajouter un autre enfant
          </button>
        </div>
      )}

      <ClubFooter />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
