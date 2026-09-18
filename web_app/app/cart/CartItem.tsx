'use client';

import React from "react";
import Link from "next/link";
import Card from "@mui/material/Card";
import { Cart } from "@/lib/models/Cart";
import { formatPrice } from "@/lib/api/client";
import QuantityControl from "./QuantityControl";

export default function CartItem({ item }: { item: Cart }) {
    return (
        <Card className="shadow-lg">
            <div className="flex flex-row">
                <Link href={`/movie/${item.movie.id}`} className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={item.movie.poster}
                        alt={item.movie.title}
                        className="h-35 w-25 rounded-l object-cover"
                    />
                </Link>

                <div className="flex grow flex-row items-center justify-between gap-2 p-3">
                    <div className="flex flex-col gap-1">
                        <Link
                            href={`/movie/${item.movie.id}`}
                            className="text-base font-medium hover:underline"
                        >
                            {item.movie.title}
                        </Link>

                        <p className="hidden text-sm text-gray-500 md:block">
                            {item.movie.year}
                        </p>

                        <p className="text-sm md:hidden">{formatPrice(item.price)}</p>

                        <div className="pt-2">
                            <QuantityControl item={item} />
                        </div>
                    </div>

                    <p className="hidden pr-2 text-lg font-semibold md:block">
                        {formatPrice(item.price * item.quantity)}
                    </p>
                </div>
            </div>
        </Card>
    );
}
