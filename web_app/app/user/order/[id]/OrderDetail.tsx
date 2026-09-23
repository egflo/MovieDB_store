'use client';

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import { HTTPError } from "ky";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getOrder } from "@/lib/api/orders";
import { formatPrice } from "@/lib/api/client";
import { GLASS_CARD } from "@/app/ui/glass";
import { CHIP, CHIP_ICON_SIZE } from "@/app/ui/chip";
import FavoriteBackdrop from "@/app/ui/FavoriteBackdrop";
import StatusPill from "@/app/user/orders/StatusPill";
import PosterThumb from "@/app/ui/PosterThumb";
import { orderDateTime, orderItems, orderShippingCost, paymentLabel } from "@/app/user/orders/format";

const PANEL = `rounded-2xl p-5 ${GLASS_CARD}`;

/** order_service answers an unknown id with 400 "Order not found for this id". */
const isNotFound = (error: unknown) =>
    error instanceof HTTPError && (error.response.status === 400 || error.response.status === 404);

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className={`flex justify-between gap-4 ${strong ? "border-t border-white/10 pt-2 text-base font-semibold" : "text-sm"}`}>
            <dt className={strong ? undefined : "text-white/60"}>{label}</dt>
            <dd>{value}</dd>
        </div>
    );
}

function DetailSkeleton() {
    const bar = "animate-pulse rounded bg-white/10";
    return (
        <div aria-busy="true" aria-label="Loading order" className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <span className={`h-8 w-48 ${bar}`} />
                <span className={`h-4 w-56 ${bar}`} />
            </div>
            <div className={`flex flex-col gap-4 ${PANEL}`}>
                {Array.from({ length: 3 }, (_, n) => (
                    <div key={n} className="flex items-center gap-3">
                        <span className={`h-20 w-14 ${bar}`} />
                        <span className={`h-4 w-40 ${bar}`} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function Message({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col items-start gap-3 py-10 text-white/70">{children}</div>;
}

export default function OrderDetail({ id }: { id: string }) {
    const { user } = useAuth();
    // Order ids are integers; anything else is a 500 from the API.
    const validId = /^\d+$/.test(id);

    const { data: order, isLoading, error } = useSWR(
        user && validId ? ["order", id, user.idToken] : null,
        ([, orderId, token]) => getOrder(token, orderId),
        { revalidateOnFocus: false },
    );

    let body: React.ReactNode;
    if (!user) {
        body = <Message><p>Please <Link href="/login" className="underline">sign in</Link> to view this order.</p></Message>;
    } else if (!validId || isNotFound(error)) {
        body = <Message><p>We couldn’t find order {validId ? `#${id}` : `“${id}”`}.</p></Message>;
    } else if (error) {
        body = <Message><p>Couldn’t load this order. Try again in a moment.</p></Message>;
    } else if (isLoading || !order) {
        body = <DetailSkeleton />;
    } else {
        const currency = order.currency?.toUpperCase();
        const price = (minor: number) => formatPrice(minor, currency);
        const shipping = orderShippingCost(order);
        const ship = order.shipping;
        const payment = paymentLabel(order);

        body = (
            <>
                <header className="flex flex-wrap items-end justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-semibold tracking-tight">Order #{order.id}</h1>
                        <p className="text-sm text-white/60">Placed {orderDateTime(order.created)}</p>
                    </div>
                    <StatusPill status={order.status} />
                </header>

                {/* grid-cols-1 (minmax(0, 1fr)) on phones: an implicit column sized
                    to its content kept long titles from truncating and widened the page. */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_320px] md:items-start">
                    <section aria-label="Items" className={`flex flex-col gap-4 ${PANEL}`}>
                        <ul className="flex flex-col divide-y divide-white/10">
                            {orderItems(order).map((item) => (
                                <li key={item.id} className="flex items-center gap-4 py-3 first:pt-0">
                                    <Link href={`/movie/${item.itemId}`} className="group flex min-w-0 flex-1 items-center gap-4">
                                        <PosterThumb url={item.photo} width={56} height={80} className="block h-20 w-14" />
                                        <div className="flex min-w-0 flex-col gap-0.5">
                                            <span className="truncate font-medium group-hover:underline">{item.description}</span>
                                            {item.quantity > 1 && (
                                                <span className="text-sm text-white/60">{item.quantity} × {price(item.price)}</span>
                                            )}
                                        </div>
                                    </Link>
                                    <span className="shrink-0 text-sm">{price(item.price * item.quantity)}</span>
                                </li>
                            ))}
                        </ul>
                        <dl className="flex flex-col gap-1.5 border-t border-white/10 pt-4">
                            <Row label="Subtotal" value={price(order.subTotal)} />
                            {shipping > 0 && <Row label="Shipping" value={price(shipping)} />}
                            <Row label="Tax" value={price(order.tax)} />
                            <Row label="Total" value={price(order.total)} strong />
                        </dl>
                    </section>

                    <div className="flex flex-col gap-4">
                        {ship && (
                            <section className={`flex flex-col gap-1 text-sm ${PANEL}`}>
                                <h2 className="mb-1 text-base font-semibold">Shipping to</h2>
                                <p>{ship.firstName} {ship.lastName}</p>
                                <p className="text-white/70">{ship.street}</p>
                                <p className="text-white/70">
                                    {[ship.city, [ship.state, ship.postcode].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                                </p>
                                <p className="text-white/70">{ship.country}</p>
                            </section>
                        )}
                        {payment && (
                            <section className={`flex flex-col gap-1 text-sm ${PANEL}`}>
                                <h2 className="mb-1 text-base font-semibold">Payment</h2>
                                <p>{payment}</p>
                            </section>
                        )}
                    </div>
                </div>
            </>
        );
    }

    return (
        // isolate keeps the backdrop's -z-10 inside this page.
        <main className="relative isolate mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-8 text-white">
            <FavoriteBackdrop />
            <Link href="/user/orders" className={`${CHIP} w-fit pl-2 pr-3.5`}>
                <ChevronLeftRoundedIcon sx={CHIP_ICON_SIZE} /> Orders
            </Link>
            {body}
        </main>
    );
}
