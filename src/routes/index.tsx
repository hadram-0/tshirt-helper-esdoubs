import { createFileRoute, Link } from "@tanstack/react-router";
import { ClubFooter, ClubHeader } from "@/components/ClubHeader";
import { GROUPS } from "@/lib/tshirt";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ES Doubs — T-shirts licenciés 2026/2027" },
      {
        name: "description",
        content:
          "Choisissez le groupe de votre enfant et renseignez sa taille de t-shirt, offert avec la licence ES Doubs 2026/2027.",
      },
      { property: "og:title", content: "ES Doubs — T-shirts licenciés 2026/2027" },
      {
        property: "og:description",
        content: "Choisissez le groupe de votre enfant et renseignez sa taille de t-shirt.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-lg px-5">
      <ClubHeader subtitle="👕 T-shirts licenciés 2026/2027" />

      <p className="text-center text-base leading-relaxed text-foreground">
        Le t-shirt est <strong>offert avec la licence</strong>.<br />
        Merci de renseigner les informations de votre enfant afin de préparer la commande.
      </p>

      <h2 className="mt-8 mb-3 text-center text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Sélectionnez votre groupe
      </h2>

      <div className="flex flex-col gap-3">
        {GROUPS.map((g) => (
          <Link
            key={g.slug}
            to="/$group"
            params={{ group: g.slug }}
            className="flex items-center justify-between rounded-xl bg-primary px-6 py-5 text-lg font-bold text-primary-foreground shadow-sm transition-transform active:scale-[0.98]"
          >
            <span>{g.label}</span>
            <span aria-hidden>→</span>
          </Link>
        ))}
      </div>

      <p className="mt-8 rounded-lg border border-accent/60 bg-accent/15 px-4 py-3 text-center text-sm font-medium text-foreground">
        ⚠️ Merci de remplir un formulaire pour chaque enfant.
      </p>

      <ClubFooter />
    </div>
  );
}
