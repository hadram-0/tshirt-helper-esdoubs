import { Link } from "@tanstack/react-router";
import logo from "@/assets/esd_logo.png.asset.json";

export function ClubHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="flex flex-col items-center gap-3 pt-8 pb-6 text-center">
      <Link to="/">
        <img src={logo.url} alt="Écusson Étoile Sportive Doubs" className="h-24 w-auto" />
      </Link>
      <h1 className="font-display text-3xl tracking-wide text-secondary uppercase">ES Doubs</h1>
      {subtitle ? (
        <p className="text-lg font-semibold text-primary">{subtitle}</p>
      ) : null}
    </header>
  );
}

export function ClubFooter() {
  return (
    <footer className="mt-10 border-t border-border pt-4 pb-10 text-center text-xs text-muted-foreground">
      Étoile Sportive Doubs — depuis 1938
    </footer>
  );
}
