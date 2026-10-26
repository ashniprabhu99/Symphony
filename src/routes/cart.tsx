import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";

const DESCRIPTION = "Review your Symphony cart and check out securely.";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [
      { title: "Cart — Symphony" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Cart — Symphony" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function CartPage() {
  const { items, isLoading, isSyncing, updateQuantity, removeItem, beginCheckout } =
    useCartStore();

  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    const tab = window.open("", "_blank");
    const checkoutUrl = await beginCheckout();
    if (!checkoutUrl) {
      tab?.close();
      toast.error("Checkout is unavailable right now. Please try again.");
      return;
    }
    if (tab) {
      tab.location.href = checkoutUrl;
    } else {
      window.location.href = checkoutUrl;
    }
  };


  return (
    <main className="min-h-screen bg-gradient-warm py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Checkout</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Your <span className="text-primary">Cart</span>
        </h1>
        <div className="mt-4 h-1 w-16 rounded-full bg-gradient-primary" />

        {items.length === 0 ? (
          <div className="mt-10 rounded-xl border-2 border-primary/25 bg-card p-10 text-center shadow-elegant">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-6">
              <Link to="/products">Shop all products</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="mt-8 divide-y divide-primary/15 rounded-xl border-2 border-primary/25 bg-card shadow-elegant">

              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 p-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.product.images?.edges?.[0]?.node && (
                      <img
                        src={item.product.images.edges[0].node.url}
                        alt={item.product.images.edges[0].node.altText ?? item.product.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/product/$handle"
                      params={{ handle: item.product.handle }}
                      className="font-medium hover:underline"
                    >
                      {item.product.title}
                    </Link>
                    <p className="mt-1 font-semibold">
                      {item.price.currencyCode} {parseFloat(item.price.amount).toFixed(2)}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeItem(item.variantId)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-xl border-2 border-primary/25 bg-card p-6 shadow-elegant">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">

                  {items[0]?.price.currencyCode || "$"} {totalPrice.toFixed(2)}
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                size="lg"
                className="mt-4 w-full"
                disabled={isLoading || isSyncing}
              >
                {isLoading || isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Checkout with Shopify
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
