'use client';

import React from "react";
import Link from "next/link";
import { Cart } from "@/lib/models/Cart";
import { formatPrice } from "@/lib/api/client";
import { MAX_PER_TITLE } from "@/lib/api/cart";
import PosterThumb from "@/app/ui/PosterThumb";
import QuantityControl from "./QuantityControl";

/** One cart line: poster and title (linking to the movie), quantity controls, line total. */
export default function CartItem({ item }: { item: Cart }) {
    const overLimit = item.quantity > MAX_PER_TITLE;
    return (
        <li className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <Link href={`/movie/${item.movie.id}`} className="shrink-0" tabIndex={-1} aria-hidden>
                <PosterThumb url={item.movie.poster} width={64} height={96} className="block h-24 w-16" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <Link href={`/movie/${item.movie.id}`} className="truncate font-medium hover:underline">
                            {item.movie.title}
                        </Link>
                        <span className="text-sm text-white/60">
                            {item.quantity > 1 ? `${item.quantity} × ${formatPrice(item.price)}` : formatPrice(item.price)}
                        </span>
                        {overLimit && (
                            <span className="text-xs text-amber-300">Limit {MAX_PER_TITLE} per title</span>
                        )}
                    </div>
                    <span className="shrink-0 font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </div>
                <QuantityControl item={item} />
            </div>
        </li>
    );
}
