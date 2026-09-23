'use client';

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import { formatPrice } from "@/lib/api/client";
import { GLASS_CARD } from "@/app/ui/glass";
import { CHIP } from "@/app/ui/chip";
import FavoriteBackdrop from "@/app/ui/FavoriteBackdrop";
import CartItem from "./CartItem";

const PANEL = `rounded-2xl p-5 ${GLASS_CARD}`;

/**
 * Checkout (the invoice flow) adds a flat $5.00 shipping when it has Stripe
 * calculate tax; see order_service's StripeService.
 */
const SHIPPING = 500;

function CartSkeleton() {
    const bar = "animate-pulse rounded bg-white/10";
    return (
        <div aria-busy="true" aria-label="Loading your cart" className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_320px] md:items-start">
            <div className={`flex flex-col gap-4 ${PANEL}`}>
                {Array.from({ length: 3 }, (_, n) => (
                    <div key={n} className="flex gap-4">
                        <span className={`h-24 w-16 ${bar}`} />
                        <div className="flex flex-1 flex-col gap-2">
                            <span className={`h-4 w-40 ${bar}`} />
                            <span className={`h-3.5 w-20 ${bar}`} />
                        </div>
                    </div>
                ))}
            </div>
            <div className={`h-44 ${PANEL}`} />
        </div>
    );
}

export default function Cart() {
    const { user } = useAuth();
    const { items, count, subtotal, loading, error } = useCart();

    let body: React.ReactNode;
    if (!user) {
        body = (
            <p className="py-10 text-white/70">
                Please <Link href="/login" className="underline">sign in</Link> to view your cart.
            </p>
        );
    } else if (loading) {
        body = <CartSkeleton />;
    } else if (error) {
        body = <p className="py-10 text-white/60">Couldn’t load your cart. Try again in a moment.</p>;
    } else if (items.length === 0) {
        body = (
            <div className="flex flex-col items-start gap-3 py-10">
                <p className="text-white/70">Your cart is empty.</p>
                <Link href="/search" className={`${CHIP} px-4`}>Browse movies</Link>
            </div>
        );
    } else {
        body = (
            // grid-cols-1 on phones so long titles truncate instead of widening the page.
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_320px] md:items-start">
                <section aria-label="Items" className={PANEL}>
                    <ul className="flex flex-col divide-y divide-white/10">
                        {items.map((item) => <CartItem item={item} key={item.id} />)}
                    </ul>
                </section>

                <section aria-label="Summary" className={`flex flex-col gap-4 md:sticky md:top-20 ${PANEL}`}>
                    <dl className="flex flex-col gap-1.5 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="text-white/60">Subtotal ({count} {count === 1 ? "item" : "items"})</dt>
                            <dd>{formatPrice(subtotal)}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-white/60">Shipping</dt>
                            <dd>{formatPrice(SHIPPING)}</dd>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-white/10 pt-2 text-base font-semibold">
                            <dt>Estimated total</dt>
                            <dd>{formatPrice(subtotal + SHIPPING)}</dd>
                        </div>
                    </dl>
                    <p className="text-xs text-white/50">Tax is added at checkout, based on your shipping address.</p>
                    <Link
                        href="/checkout"
                        className="flex h-11 items-center justify-center rounded-full bg-white font-semibold text-black transition-colors hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                        Checkout
                    </Link>
                </section>
            </div>
        );
    }

    return (
        // isolate keeps the backdrop's -z-10 inside this page.
        <main className="relative isolate mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-16 pt-8 text-white">
            <FavoriteBackdrop />
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
                <p className="h-5 text-sm text-white/60">
                    {user && !loading && !error && items.length > 0 && `${count} ${count === 1 ? "item" : "items"}`}
                </p>
            </header>
            {body}
        </main>
    );
}
