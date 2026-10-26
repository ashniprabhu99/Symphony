import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ShoppingCart, Loader2, ArrowLeft, Check, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ProductReviews } from "@/components/ProductReviews";
import { FaqSection } from "@/components/FaqSection";
import { fetchProductByHandle } from "@/lib/shopify";

import { useCartStore } from "@/stores/cartStore";
import { Link } from "@tanstack/react-router";


export const Route = createFileRoute("/product/$handle")({
  component: ProductPage,
  head: ({ params }) => ({
    meta: [
      { title: `${params.handle} — Symphony` },
      { name: "description", content: `Shop ${params.handle} at Symphony.` },
      { property: "og:title", content: `${params.handle} — Symphony` },
      { property: "og:description", content: `Shop ${params.handle} at Symphony.` },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ProductPage() {
  const { handle } = Route.useParams();
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", handle],
    queryFn: () => fetchProductByHandle(handle),
  });

  const addItem = useCartStore((state) => state.addItem);
  const buyNow = useCartStore((state) => state.buyNow);
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const isBusy = isAdding || isBuyingNow;
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrent(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", onSelect);
    };
  }, [carouselApi]);


  if (isLoading) {
    return (
      <main className="min-h-screen py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-lg bg-muted" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-32 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-destructive">Product not found.</p>
          <Button asChild className="mt-4">
            <Link to="/">Back to shop</Link>
          </Button>
        </div>
      </main>
    );
  }

  const images = product.images.edges;

  const variant =
    product.variants.edges.find((v) => {
      const node = v.node;
      return node.selectedOptions.every((option) => selectedOptions[option.name] === option.value);
    })?.node ?? product.variants.edges[0]?.node;

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddToCart = async () => {
    if (!variant) return;
    setIsAdding(true);
    try {
      await addItem({
        product: {
          id: product.id,
          title: product.title,
          handle: product.handle,
          images: product.images,
        },
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!variant) return;
    setIsBuyingNow(true);
    try {
      const checkoutUrl = await buyNow({
        product: {
          id: product.id,
          title: product.title,
          handle: product.handle,
          images: product.images,
        },
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions,
      });
      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank");
      }
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-warm py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" asChild className="mb-6 -ml-2 gap-2 text-primary hover:text-primary">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to shop
          </Link>
        </Button>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            {images.length === 0 ? (
              <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-primary/25 bg-muted text-muted-foreground shadow-elegant">
                No image
              </div>
            ) : (
              <>
                <Carousel setApi={setCarouselApi} opts={{ loop: images.length > 1 }}>
                  <CarouselContent>
                    {images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-square overflow-hidden rounded-xl border-2 border-primary/25 bg-muted shadow-elegant">
                          <img
                            src={image.node.url}
                            alt={image.node.altText ?? product.title}
                            className="h-full w-full object-cover"
                            draggable={false}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {images.length > 1 && (
                    <>
                      <CarouselPrevious className="left-3" />
                      <CarouselNext className="right-3" />
                    </>
                  )}
                </Carousel>

                {images.length > 1 && (
                  <>
                    <div className="flex justify-center gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          aria-label={`Go to image ${index + 1}`}
                          onClick={() => carouselApi?.scrollTo(index)}
                          className={`h-2 rounded-full transition-all ${
                            current === index ? "w-6 bg-primary" : "w-2 bg-primary/30"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => carouselApi?.scrollTo(index)}
                          className={`aspect-square overflow-hidden rounded-md bg-muted ${
                            current === index ? "ring-2 ring-primary" : ""
                          }`}
                        >
                          <img
                            src={image.node.url}
                            alt={image.node.altText ?? product.title}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>


          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{product.title}</h1>
            <div className="mt-4 h-1 w-16 rounded-full bg-gradient-primary" />
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <p className="text-2xl font-semibold text-primary">
                {variant?.price.currencyCode ?? product.priceRange.minVariantPrice.currencyCode}{" "}
                {parseFloat(variant?.price.amount ?? product.priceRange.minVariantPrice.amount).toFixed(2)}
              </p>
              {variant?.compareAtPrice &&
                parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount) && (
                  <>
                    <p className="text-lg text-muted-foreground line-through">
                      {variant.compareAtPrice.currencyCode}{" "}
                      {parseFloat(variant.compareAtPrice.amount).toFixed(2)}
                    </p>
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      {Math.round(
                        (1 -
                          parseFloat(variant.price.amount) /
                            parseFloat(variant.compareAtPrice.amount)) *
                          100,
                      )}
                      % OFF
                    </span>
                  </>
                )}
            </div>

            {product.options.some((option) => option.name !== "Title" || option.values.length > 1) && (
              <div className="mt-6 space-y-4">
                {product.options
                  .filter((option) => !(option.name === "Title" && option.values.length === 1))
                  .map((option) => (
                    <div key={option.name}>
                      <label className="text-sm font-medium text-foreground">{option.name}</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {option.values.map((value) => (
                          <button
                            key={value}
                            onClick={() => handleOptionChange(option.name, value)}
                            className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                              selectedOptions[option.name] === value
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input bg-background hover:bg-accent"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={isBusy || !variant || !variant.availableForSale}
                size="lg"
                className="w-full sm:w-auto"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : added ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {variant?.availableForSale ? "Add to Cart" : "Out of Stock"}
                  </>
                )}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={isBusy || !variant || !variant.availableForSale}
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {isBuyingNow ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>

            <div className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                Description
              </h2>

              <p className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        <ProductReviews productHandle={product.handle} />
      </div>

      <FaqSection />
    </main>

  );
}

