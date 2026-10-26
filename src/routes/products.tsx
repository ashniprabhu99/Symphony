import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { ProductGrid } from "@/components/ProductGrid";
import { FaqSection } from "@/components/FaqSection";
import { fetchProducts } from "@/lib/shopify";

const DESCRIPTION =
  "Browse every Symphony product — Utilities, Press-On Nails and 3D Car Frames in one place.";


export const Route = createFileRoute("/products")({
  component: AllProductsPage,
  head: () => ({
    meta: [
      { title: "All Products — Symphony" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "All Products — Symphony" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function AllProductsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => fetchProducts(100),
  });

  return (
    <main className="min-h-screen bg-gradient-warm py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Catalogue</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          All <span className="text-primary">Products</span>
        </h1>
        <div className="mt-4 h-1 w-16 rounded-full bg-gradient-primary" />
        <p className="mt-4 text-muted-foreground">{DESCRIPTION}</p>
        <ProductGrid products={data} isLoading={isLoading} error={error} />
      </div>

      <FaqSection />
    </main>
  );
}
