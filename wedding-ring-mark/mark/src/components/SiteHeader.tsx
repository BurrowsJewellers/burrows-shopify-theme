import { Link } from "@tanstack/react-router";
import logo from "@/assets/brand/burrows-logo.png.asset.json";

export function SiteHeader() {
  return (
    <header className="border-b-2 border-brand-gold bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" aria-label="Burrows Jewellers — Ring Designer">
          <img src={logo.url} alt="Burrows Jewellers" className="h-12 w-auto md:h-14" />
        </Link>
        <nav className="flex items-center gap-6 text-sm uppercase tracking-widest md:gap-8">
          <Link
            to="/"
            className="text-muted-foreground transition-colors hover:text-primary"
            activeProps={{ className: "text-primary" }}
            activeOptions={{ exact: true }}
          >
            Ring Designer
          </Link>
          <Link
            to="/catalogue"
            className="text-muted-foreground transition-colors hover:text-primary"
            activeProps={{ className: "text-primary" }}
          >
            Catalogue
          </Link>
        </nav>
      </div>
    </header>
  );
}
