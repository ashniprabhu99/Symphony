import { Link } from "@tanstack/react-router";
import { ShoppingCart, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

interface ProductCardProps {
  product: ShopifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const buyNow = useCartStore((state) => state.buyNow);
  const pendingVariantId = useCartStore((state) => state.pendingVariantId);

  const node = product.node;
  const firstImage = node.images.edges[0]?.node;
  const variants = node.variants.edges;
  const selectedVariant = variants.find((v) => v.node.availableForSale)?.node ?? variants[0]?.node;
  const isSoldOut =
    node.availableForSale === false || !variants.some((v) => v.node.availableForSale);
  const isAdding = !!selectedVariant && pendingVariantId === selectedVariant.id;
  const price = selectedVariant?.price ?? node.priceRange.minVariantPrice;
  const compareAtPrice = selectedVariant?.compareAtPrice ?? null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedVariant) return;

    await addItem({
      product: {
        id: node.id,
        title: node.title,
        handle: node.handle,
        images: node.images,
      },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions,
    });
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedVariant) return;

    const checkoutUrl = await buyNow({
      product: {
        id: node.id,
        title: node.title,
        handle: node.handle,
        images: node.images,
      },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions,
    });
    if (checkoutUrl) window.open(checkoutUrl, "_blank");
  };

  return (
    <Link
      to="/product/$handle"
      params={{ handle: node.handle }}
      className="group flex flex-col overflow-hidden rounded-xl border-2 border-primary/20 bg-card transition-all hover:-translate-y-1 hover:border-primary hover:shadow-elegant"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {firstImage ? (
          <img
            src={firstImage.url}
            alt={firstImage.altText ?? node.title}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isSoldOut ? "opacity-50 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        {isSoldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-background">
            Sold out
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <h3 className="font-medium leading-tight text-foreground transition-colors group-hover:text-primary">
          {node.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{node.description}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="flex flex-wrap items-baseline gap-1.5">
            <span className="font-semibold text-primary">
              {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
            </span>
            {compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount) && (
              <span className="text-xs text-muted-foreground line-through">
                {compareAtPrice.currencyCode} {parseFloat(compareAtPrice.amount).toFixed(2)}
              </span>
            )}
          </span>
          <Button
            size="sm"
            variant={isSoldOut ? "secondary" : "default"}
            onClick={handleAddToCart}
            disabled={isAdding || !selectedVariant || isSoldOut}
            className="h-8 gap-1.5"
          >
            {isSoldOut ? (
              "Sold out"
            ) : (
              <>
                {isAdding ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ShoppingCart className="h-3.5 w-3.5" />
                )}
                Add
              </>
            )}
          </Button>
        </div>
        {!isSoldOut && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleBuyNow}
            disabled={isAdding || !selectedVariant}
            className="mt-2 h-8 w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Buy Now"}
          </Button>
        )}
      </div>
    </Link>
  );
}
