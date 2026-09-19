'use client';

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getOrders } from "@/lib/api/orders";
import { formatPrice } from "@/lib/api/client";
import StatusPill from "./StatusPill";

export default function Orders() {
    const { user } = useAuth();

    const { data, isLoading, error } = useSWR(
        user ? ["orders", user.idToken] : null,
        ([, token]) => getOrders(token),
        { revalidateOnFocus: false },
    );

    if (!user) {
        return (
            <div className="p-6">
                <p className="text-lg">
                    Please{" "}
                    <Link href="/login" className="underline">
                        sign in
                    </Link>{" "}
                    to see your orders.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-10">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <div className="p-6 text-red-500">Failed to load your orders.</div>;
    }

    const orders = data?.content ?? [];

    if (orders.length === 0) {
        return (
            <div className="flex flex-col gap-3 p-6">
                <h1 className="text-xl font-medium">No orders yet</h1>
                <Link href="/" className="underline">
                    Browse movies
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <h1 className="text-xl font-medium">Orders</h1>

            <div className="flex flex-col gap-3 md:max-w-3xl">
                {orders.map((o) => (
                    <Link key={o.id} href={`/user/order/${o.id}`}>
                        <Card className="p-4 hover:shadow-lg">
                            <div className="flex flex-row items-start justify-between gap-4">
                                <div className="text-sm">
                                    <p className="font-medium">Order #{o.id}</p>
                                    <p className="text-gray-500">
                                        {new Date(o.created).toLocaleDateString()} ·{" "}
                                        {o.items?.length ?? 0}{" "}
                                        {o.items?.length === 1 ? "item" : "items"}
                                    </p>
                                </div>

                                <div className="flex shrink-0 flex-col items-end gap-1">
                                    <span className="font-medium">
                                        {formatPrice(o.total)}
                                    </span>
                                    <StatusPill status={o.status} />
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
