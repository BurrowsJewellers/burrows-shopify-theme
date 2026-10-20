import { createFileRoute, Link } from "@tanstack/react-router";
import { RINGS } from "../data/rings";
import { METALS } from "../lib/ring-options";

export const Route = createFileRoute("/catalogue")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Infinity Rings Catalogue — Burrows Jewellers" },
      {
        name: "description",
        content:
          "Browse the full Infinity Rings wedding band collection available at Burrows Jewellers — gold, platinum, titanium, tantalum, zirconium and more.",
      },
      { property: "og:title", content: "Infinity Rings Catalogue — Burrows Jewellers" },
      {
        property: "og:description",
        content:
          "Browse the full Infinity Rings wedding band collection available at Burrows Jewellers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CataloguePage,
});

function RingGrid({ rings }: { rings: typeof RINGS }) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
      {rings.map((ring) => {
          const firstMetal = Object.keys(ring.metals)[0];
          return (
            <Link
              key={ring.id}
              to="/rings/$ringId"
              params={{ ringId: ring.id }}
              className="group rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-lg"
            >
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-background">
                <img
                  src={firstMetal ? ring.metals[firstMetal] : undefined}
                  alt={ring.name}
                  loading="lazy"
                  className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-center font-serif text-lg text-foreground">
                {ring.displayName ?? ring.name}
              </p>
              {ring.displayName && (
                <p className="text-center text-xs text-muted-foreground">{ring.name}</p>
              )}
              <p className="mt-1 text-center text-xs text-muted-foreground">
                {Object.keys(ring.metals)
                  .map((m) => METALS[m]?.label ?? m)
                  .join(" · ")}
              </p>
            </Link>
          );
        })}
    </div>
  );
}

function CataloguePage() {
  const classic = RINGS.filter((r) => r.range === "classic");
  const signature = RINGS.filter((r) => r.range !== "classic");
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-serif text-4xl tracking-wide text-foreground">The Collection</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Every Infinity ring is made to order. Choose a style to personalise it in the
        ring designer.
      </p>
      <h2 className="mt-12 font-serif text-2xl tracking-wide text-foreground">
        Classic Wedding Bands
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Timeless plain bands — court, flat and bevelled profiles in your choice of metal
        and width.
      </p>
      <RingGrid rings={classic} />
      <h2 className="mt-14 font-serif text-2xl tracking-wide text-foreground">
        Signature Designs
      </h2>
      <RingGrid rings={signature} />
    </main>
  );
}
