import { createFileRoute, notFound } from "@tanstack/react-router";
import { RINGS } from "../data/rings";
import { RingDesigner, type SharedDesign } from "../components/RingDesigner";

const SHARE_KEYS = ["metal", "side", "tone", "w", "t", "profile", "finish", "size", "eng", "font", "stone"] as const;

export const Route = createFileRoute("/rings/$ringId")({
  staticData: { sitemap: true },
  validateSearch: (search: Record<string, unknown>): SharedDesign => {
    const out: SharedDesign = {};
    for (const k of SHARE_KEYS) {
      const v = search[k];
      if (typeof v === "string" || typeof v === "number") out[k] = String(v).slice(0, 40);
    }
    return out;
  },
  loader: ({ params }) => {
    const ring = RINGS.find((r) => r.id === params.ringId);
    if (!ring) throw notFound();
    return { ring };
  },
  head: ({ loaderData }) => {
    const ring = loaderData?.ring;
    const code = ring?.name ?? "Ring";
    const friendly = ring?.displayName ?? code;
    const label = ring?.displayName ? `${friendly} · ${code}` : code;
    return {
      meta: [
        { title: `${label} — Burrows Jewellers` },
        {
          name: "description",
          content: `Personalise the Infinity ${friendly} (${code}) wedding ring — choose metal, width, fit, finish and finger size at Burrows Jewellers.`,
        },
        {
          property: "og:title",
          content: `${label} — Burrows Jewellers`,
        },
        {
          property: "og:description",
          content: `Personalise the Infinity ${friendly} (${code}) wedding ring at Burrows Jewellers.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: RingPage,
});

function RingPage() {
  const { ring } = Route.useLoaderData();
  const shared = Route.useSearch();
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-10 text-center font-serif text-4xl tracking-wide text-foreground">
        {ring.displayName ?? ring.name}
        {ring.displayName && (
          <span className="ml-3 align-middle text-lg font-normal text-muted-foreground">
            · {ring.name}
          </span>
        )}
      </h1>
      <RingDesigner key={ring.id} initialRingId={ring.id} shared={shared} />
    </main>
  );
}
