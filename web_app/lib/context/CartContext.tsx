'use client';

import React, { createContext, useContext, ReactNode } from "react";
import useSWR from "swr";
import { Cart } from "@/lib/models/Cart";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getCart, cartCount, cartSubtotal } from "@/lib/api/cart";

interface CartContextValue {
    items: Cart[];
    /** Total units across all lines, for the nav badge. */
    count: number;
    /** Subtotal in minor units (cents). */
    subtotal: number;
    loading: boolean;
    error: unknown;
    /** Re-fetch the cart; call after any mutation. */
    refresh: () => Promise<unknown>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CART_KEY = "cart";

export function CartProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    // Keying on the token means the cart refetches on sign-in and clears on
    // sign-out, which replaces web_store's onAuthStateChanged subscription.
    const { data, error, isLoading, mutate } = useSWR(
        user ? [CART_KEY, user.idToken] : null,
        ([, token]) => getCart(token),
        { revalidateOnFocus: false },
    );

    const items = data ?? [];

    return (
        <CartContext.Provider
            value={{
                items,
                count: cartCount(items),
                subtotal: cartSubtotal(items),
                loading: Boolean(user) && isLoading,
                error,
                refresh: () => mutate(),
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
