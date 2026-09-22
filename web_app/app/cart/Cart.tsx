'use client';

import React from "react";
import Link from "next/link";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import { formatPrice } from "@/lib/api/client";
import CartItem from "./CartItem";

export default function Cart() {
    const { user } = useAuth();
    const { items, count, subtotal, loading, error } = useCart();

    if (!user) {
        return (
            <div className="p-6">
                <p className="text-lg">
                    Please{" "}
                    <Link href="/login" className="underline">
                        sign in
                    </Link>{" "}
                    to view your cart.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center p-10">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <div className="p-6 text-red-500">Failed to load your cart.</div>;
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col gap-3 p-6">
                <h1 className="text-xl font-semibold">Your cart is empty</h1>
                <Link href="/" className="underline">
                    Browse movies
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:flex-row md:items-start">
            <div className="flex w-full flex-col gap-2 md:w-2/3">
                {items.map((item) => (
                    <CartItem item={item} key={item.id} />
                ))}
            </div>

            <div className="w-full md:sticky md:top-4 md:w-1/3">
                <Card>
                    <CardContent className="flex flex-col gap-2">
                        <div className="flex justify-between">
                            <span className="text-lg text-gray-500">
                                Subtotal ({count} {count === 1 ? "item" : "items"})
                            </span>
                            <span className="text-lg font-semibold">
                                {formatPrice(subtotal)}
                            </span>
                        </div>

                        <Divider className="my-1" />

                        <p className="text-sm text-gray-500">
                            Tax and shipping are calculated at checkout.
                        </p>

                        <Button
                            component={Link}
                            href="/checkout"
                            variant="contained"
                            size="large"
                            fullWidth
                        >
                            Checkout
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
