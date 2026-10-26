import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { ProductGrid } from "@/components/ProductGrid";
import { FaqSection } from "@/components/FaqSection";
import { fetchProducts } from "@/lib/shopify";

const QUERY = 'product_type:"3D Car Frames"';
const DESCRIPTION = "Celebrate iconic cars with museum-quality 3D collectible frames.";
const COVER_URL =
  "https://cdn.shopify.com/s/files/1/0798/4319/7159/collections/WhatsApp_Image_2026-08-06_at_19.56.36.jpg?v=1786028431";

export const Route = createFileRoute("/3d-car-frames")({
  component: CarFramesPage,
  head: () => ({
    meta: [
      { title: "3D Car Frames — Symphony" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "3D Car Frames — Symphony" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: COVER_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: COVER_URL },
    ],
  }),
});

function CarFramesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products", QUERY],
    queryFn: () => fetchProducts(50, QUERY),
  });

  return (
    <main className="min-h-screen">
      <section className="relative isolate overflow-hidden border-b-4 border-primary">
        <img
          src={COVER_URL}
          alt="3D Car Frames cover"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-destructive/50" />
        <div className="absolute inset-0 bg-gradient-primary opacity-25 mix-blend-multiply" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <span className="inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-elegant">
            Collection
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-hero-foreground md:text-5xl">
            3D Car Frames
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
