'use client';

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getOrder } from "@/lib/api/orders";
import { formatPrice } from "@/lib/api/client";
import StatusPill from "@/app/user/orders/StatusPill";

export default function OrderDetail({ id }: { id: string }) {
    const { user } = useAuth();

    const { data: order, isLoading, error } = useSWR(
        user ? ["order", id, user.idToken] : null,
        ([, orderId, token]) => getOrder(token, orderId),
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
                    to view this order.
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

    if (error || !order) {
        return <div className="p-6 text-red-500">Could not load that order.</div>;
    }

    const ship = order.shipping;

    return (
        <div className="flex flex-col gap-4 p-4 md:max-w-3xl">
            <div className="flex flex-row items-center justify-between">
                <div>
                    <h1 className="text-xl font-medium">Order #{order.id}</h1>
                    <p className="text-sm text-gray-500">
                        Placed {new Date(order.created).toLocaleString()}
                    </p>
                </div>
                <StatusPill status={order.status} />
            </div>

            <Card>
                <CardContent className="flex flex-col gap-3">
                    {order.items?.map((i) => (
                        <div key={i.id} className="flex flex-row items-center gap-3">
                            {i.photo && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={i.photo}
                                    alt={i.description}
                                    className="h-20 w-14 rounded object-cover"
                                />
                            )}
                            <div className="flex grow flex-col text-sm">
                                <span className="font-medium">{i.description}</span>
                                <span className="text-gray-500">
                                    Qty {i.quantity} · SKU {i.sku}
                                </span>
                            </div>
                            <span className="text-sm">
                                {formatPrice(i.price * i.quantity)}
                            </span>
                        </div>
                    ))}

                    <Divider className="my-1" />

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span>{formatPrice(order.subTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tax</span>
                        <span>{formatPrice(order.tax)}</span>
                    </div>
                    <div className="flex justify-between text-base font-medium">
                        <span>Total</span>
                        <span>{formatPrice(order.total)}</span>
                    </div>
                </CardContent>
            </Card>

            {ship && (
                <Card>
                    <CardContent className="flex flex-col gap-1 text-sm">
                        <h2 className="text-base font-medium">Shipping to</h2>
                        <p>
                            {ship.firstName} {ship.lastName}
                        </p>
                        <p className="text-gray-500">{ship.street}</p>
                        <p className="text-gray-500">
                            {ship.city}, {ship.state} {ship.postcode}
                        </p>
                        <p className="text-gray-500">{ship.country}</p>
                    </CardContent>
                </Card>
            )}

            <Link href="/user/orders" className="text-sm underline">
                Back to orders
            </Link>
        </div>
    );
}
