import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  type ShopifyProduct,
  type CartItemProduct,
  createShopifyCart,
  addLineToShopifyCart,
  updateShopifyCartLine,
  removeLineFromShopifyCart,
  storefrontApiRequest,
  formatCheckoutUrl,
  fetchCheckoutUrl,
  CART_QUERY,
} from "@/lib/shopify";


export interface CartItem {
  lineId: string | null;
  product: CartItemProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  isOpen: boolean;
  /** Variant currently being mutated, so only that product shows a spinner. */
  pendingVariantId: string | null;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  buyNow: (item: Omit<CartItem, "lineId">) => Promise<string | null>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
  /** Resolves a fresh, valid Shopify checkout URL right before redirecting. */
  beginCheckout: () => Promise<string | null>;
  setOpen: (open: boolean) => void;
}


export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      isOpen: false,
      pendingVariantId: null,

      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existingItem = items.find((i) => i.variantId === item.variantId);

        set({ isLoading: true, pendingVariantId: item.variantId });
        try {
          if (!cartId) {
            const result = await createShopifyCart({
              variantId: item.variantId,
              quantity: item.quantity,
              product: item.product,
            });
            if (result) {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: [{ ...item, lineId: result.lineId }],
                isOpen: true,
              });
            }
          } else if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            if (!existingItem.lineId) {
              console.error("Cannot update quantity for item without lineId:", existingItem);
              return;
            }
            const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
            if (result.success) {
              const currentItems = get().items;
              set({
                items: currentItems.map((i) =>
                  i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i,
                ),
                isOpen: true,
              });
            } else if (result.cartNotFound) {
              clearCart();
            }
          } else {
            const result = await addLineToShopifyCart(cartId, {
              variantId: item.variantId,
              quantity: item.quantity,
              product: item.product,
            });
            if (result.success) {
              const currentItems = get().items;
              set({
                items: [...currentItems, { ...item, lineId: result.lineId ?? null }],
                isOpen: true,
              });
            } else if (result.cartNotFound) {
              clearCart();
            }
          }
        } catch (error) {
          console.error("Failed to add item:", error);
        } finally {
          set({ isLoading: false, pendingVariantId: null });
        }
      },

      buyNow: async (item) => {
        const { items, cartId } = get();
        const existingItem = items.find((i) => i.variantId === item.variantId);

        set({ isLoading: true, pendingVariantId: item.variantId });
        try {
          if (!cartId) {
            const result = await createShopifyCart({
              variantId: item.variantId,
              quantity: item.quantity,
              product: item.product,
            });
            if (result) {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: [{ ...item, lineId: result.lineId }],
              });
              return result.checkoutUrl;
            }
            return null;
          }

          if (!existingItem) {
            const result = await addLineToShopifyCart(cartId, {
              variantId: item.variantId,
              quantity: item.quantity,
              product: item.product,
            });
            if (result.success) {
              const currentItems = get().items;
              set({
                items: [...currentItems, { ...item, lineId: result.lineId ?? null }],
              });
            } else if (result.cartNotFound) {
              get().clearCart();
              return null;
            }
          }

          return await get().beginCheckout();
        } catch (error) {
          console.error("Failed to buy now:", error);
          return null;
        } finally {
          set({ isLoading: false, pendingVariantId: null });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }

        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;

        set({ isLoading: true, pendingVariantId: variantId });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            const currentItems = get().items;
            set({
              items: currentItems.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
            });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to update quantity:", error);
        } finally {
          set({ isLoading: false, pendingVariantId: null });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;

        set({ isLoading: true, pendingVariantId: variantId });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const currentItems = get().items;
            const newItems = currentItems.filter((i) => i.variantId !== variantId);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to remove item:", error);
        } finally {
          set({ isLoading: false, pendingVariantId: null });
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => {
        const url = get().checkoutUrl;
        return url ? formatCheckoutUrl(url) : null;
      },
      setOpen: (open) => set({ isOpen: open }),

      beginCheckout: async () => {
        const { cartId, checkoutUrl } = get();
        // Never redirect to a cart GID or a stale/self-hosted URL.
        const fallback = checkoutUrl ? formatCheckoutUrl(checkoutUrl) : null;
        if (!cartId) return fallback;

        try {
          const fresh = await fetchCheckoutUrl(cartId);
          if (fresh) {
            set({ checkoutUrl: fresh });
            return fresh;
          }
        } catch (error) {
          console.error("Failed to resolve checkout URL:", error);
        }
        return fallback;
      },

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;

        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          if (!data) return;
          const cart = data?.data?.cart;
          // Cart expired / completed at checkout -> Shopify returns null.
          if (!cart) {
            clearCart();
            return;
          }
          // An emptied cart has no lines. totalQuantity can read 0 for lines
          // that are temporarily unavailable, so it must not clear the cart.
          const lineCount = cart.lines?.edges?.length ?? 0;
          if (lineCount === 0) {
            clearCart();
            return;
          }
          if (cart.checkoutUrl) {
            set({ checkoutUrl: formatCheckoutUrl(cart.checkoutUrl) });
          }
        } catch (error) {
          console.error("Failed to sync cart with Shopify:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

    }),
    {
      name: "shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        checkoutUrl: state.checkoutUrl,
      }),
      // isOpen and UI-only state are intentionally not persisted.
    },
  ),
);
