import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { ProductGrid } from "@/components/ProductGrid";
import { FaqSection } from "@/components/FaqSection";
import { fetchProducts } from "@/lib/shopify";
import pressOnNailsCover from "@/assets/press-on-nails-cover.jpg.asset.json";

const QUERY = 'product_type:"Press-On Nails"';
const DESCRIPTION = "Salon-ready press-on nail sets you can apply in minutes.";

export const Route = createFileRoute("/press-on-nails")({
  component: PressOnNailsPage,
  head: () => ({
    meta: [
      { title: "Press-On Nails — Symphony" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Press-On Nails — Symphony" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function PressOnNailsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products", QUERY],
    queryFn: () => fetchProducts(50, QUERY),
  });

  return (
    <main className="min-h-screen">
      <section className="relative isolate overflow-hidden border-b-4 border-primary">
        <img
          src={pressOnNailsCover.url}
          alt="Press-On Nails cover"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-destructive/50" />
        <div className="absolute inset-0 bg-gradient-primary opacity-25 mix-blend-multiply" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <span className="inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-elegant">
            Collection
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-hero-foreground md:text-5xl">
            Press-On Nails
          </h1>
          <div className="mt-5 h-1 w-24 rounded-full bg-primary" />
          <p className="mt-5 max-w-xl text-lg text-hero-foreground/90">{DESCRIPTION}</p>
        </div>
      </section>

      <section className="bg-gradient-warm py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductGrid products={data} isLoading={isLoading} error={error} />
        </div>
      </section>

      <FaqSection />
    </main>
  );
}
