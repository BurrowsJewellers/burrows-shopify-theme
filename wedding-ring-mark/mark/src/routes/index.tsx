import { createFileRoute, Link } from "@tanstack/react-router";
import { RingDesigner } from "../components/RingDesigner";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Design Your Wedding Ring — Burrows Jewellers" },
      {
        name: "description",
        content:
          "Personalise your Infinity wedding ring in real time: choose the style, metal, width, profile, finish and finger size, then send your design to Burrows Jewellers.",
      },
      { property: "og:title", content: "Design Your Wedding Ring — Burrows Jewellers" },
      {
        property: "og:description",
        content:
          "Personalise your Infinity wedding ring in real time with Burrows Jewellers' online ring designer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-4xl tracking-wide text-foreground md:text-5xl">
          Design Your Wedding Ring
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Choose a style from the Infinity Rings collection and personalise it in real
          time — metal, width, profile, finish and finger size. When it's right, send
          your design straight to us.{" "}
          <Link to="/catalogue" className="underline underline-offset-4 hover:text-foreground">
            Browse the full catalogue
          </Link>
        </p>
      </div>
      <RingDesigner />
    </main>
  );
}
