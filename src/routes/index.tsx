import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { fetchProducts } from "@/lib/shopify";
import { HeroVideo } from "@/components/HeroVideo";
import { ProductGrid } from "@/components/ProductGrid";
import { FaqSection } from "@/components/FaqSection";
import heroVideo from "@/assets/hero-autoplay.mp4";

export const DESCRIPTION =
  "Shop Symphony — premium 3D Car Frames.";

const QUERY = 'product_type:"3D Car Frames"';

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Symphony — 3D Car Frames" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Symphony — 3D Car Frames" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products", QUERY],
    queryFn: () => fetchProducts(50, QUERY),
  });

  return (
    <main className="min-h-screen">
      <section className="relative isolate aspect-video overflow-hidden md:aspect-auto md:min-h-[480px] lg:min-h-[560px]">
        <HeroVideo
          src={heroVideo}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-6 pt-4 sm:px-6 md:justify-center md:pb-0 md:pt-0 lg:px-8">
          <div className="max-w-2xl md:py-16">
            <h1 className="text-2xl font-semibold tracking-tight text-hero-foreground md:text-4xl lg:text-6xl">
              Curated for everyday elegance
            </h1>
            <div className="mt-3 h-1 w-16 rounded-full bg-primary md:mt-5 md:w-24" />
            <p className="mt-3 hidden text-sm text-hero-foreground/90 sm:block md:text-lg">
              {DESCRIPTION}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 md:mt-8">
              <Link
                to="/products"
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03] md:px-6 md:py-3 md:text-sm"
              >
                Shop all products
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="border-y-4 border-primary bg-gradient-warm py-12 md:py-20">
        <div className="mx-auto mb-8 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Collection
          </p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
            3D <span className="text-primary">Car Frames</span>
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-primary" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductGrid products={data} isLoading={isLoading} error={error} />
        </div>
      </section>

      <FaqSection />
    </main>
  );
}
