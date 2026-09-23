'use client';

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getOrders } from "@/lib/api/orders";
import { formatPrice } from "@/lib/api/client";
import { Order } from "@/lib/models/Order";
import { GLASS_CARD } from "@/app/ui/glass";
import { CHIP } from "@/app/ui/chip";
import Pager from "@/app/ui/Pager";
import FavoriteBackdrop from "@/app/ui/FavoriteBackdrop";
import StatusPill from "./StatusPill";
import OrderThumb from "./OrderThumb";
import { orderDate, orderTitles } from "./format";

/** getOrders' default, so page 1 shares its cache entry with the account page's Orders card. */
const PAGE_SIZE = 20;
const THUMBS = 3;

const ROW = `flex items-center gap-4 rounded-2xl p-4 ${GLASS_CARD}`;

function OrderRow({ order }: { order: Order }) {
    const items = order.items ?? [];
    const count = items.reduce((n, i) => n + i.quantity, 0);
    return (
        <li>
            <Link
                href={`/user/order/${order.id}`}
                className={`group transition-colors hover:bg-white/[0.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${ROW}`}
            >
                {/* Fixed width (three 44px thumbs and their gaps; one on phones)
                    so the text lines up across orders with fewer items. */}
                <span className="flex w-11 shrink-0 gap-1.5 sm:w-36" aria-hidden>
                    {items.slice(0, THUMBS).map((item, n) => (
                        // Just the first on phones, where the row is narrow.
                        <span key={item.id} className={n > 0 ? "hidden sm:block" : undefined}>
                            <OrderThumb url={item.photo} width={44} height={64} className="block h-16 w-11" />
                        </span>
                    ))}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="font-semibold">
                        Order #{order.id} <span className="font-normal text-white/60">· {orderDate(order.created)}</span>
                    </p>
                    <p className="truncate text-sm text-white/75">{orderTitles(order)}</p>
                    <p className="text-xs text-white/50">{count} {count === 1 ? "item" : "items"}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="font-semibold">{formatPrice(order.total, order.currency?.toUpperCase())}</span>
                    <StatusPill status={order.status} />
                </div>
                <ChevronRightRoundedIcon className="shrink-0 text-white/40 transition-colors group-hover:text-white/80" />
            </Link>
        </li>
    );
}

function OrdersSkeleton() {
    return (
        <ul className="flex flex-col gap-3" aria-busy="true" aria-label="Loading orders">
            {Array.from({ length: 4 }, (_, n) => (
                <li key={n} className={ROW}>
                    <span className="h-16 w-11 animate-pulse rounded-md bg-white/10" />
                    <div className="flex flex-1 flex-col gap-2">
                        <span className="h-4 w-48 animate-pulse rounded bg-white/10" />
                        <span className="h-3.5 w-64 max-w-full animate-pulse rounded bg-white/10" />
                    </div>
                    <span className="h-4 w-16 animate-pulse rounded bg-white/10" />
                </li>
            ))}
        </ul>
    );
}

export default function Orders() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const { data, isLoading, error } = useSWR(
        user ? (page === 1 ? ["orders", user.idToken] : ["orders", user.idToken, page]) : null,
        ([, token, p]: [string, string, number?]) => getOrders(token, PAGE_SIZE, (p ?? 1) - 1),
        { revalidateOnFocus: false, keepPreviousData: true },
    );

    const goToPage = (n: number) => {
        router.push(n > 1 ? `/user/orders?page=${n}` : "/user/orders", { scroll: false });
        window.scrollTo({ top: 0 });
    };

    let body: React.ReactNode;
    if (!user) {
        body = (
            <p className="py-10 text-white/70">
                Please <Link href="/login" className="underline">sign in</Link> to see your orders.
            </p>
        );
    } else if (isLoading && !data) {
        body = <OrdersSkeleton />;
    } else if (error) {
        body = <p className="py-10 text-white/60">Couldn’t load your orders. Try again in a moment.</p>;
    } else if (!data || data.content.length === 0) {
        body = (
            <div className="flex flex-col items-start gap-3 py-10">
                <p className="text-white/70">{page > 1 ? "No orders on this page." : "No orders yet."}</p>
                <Link href={page > 1 ? "/user/orders" : "/search"} className={`${CHIP} px-4`}>
                    {page > 1 ? "Back to page 1" : "Browse movies"}
                </Link>
            </div>
        );
    } else {
        body = (
            <>
                {/* Dim, rather than blank, while another page loads. */}
                <ul className={`flex flex-col gap-3 transition-opacity ${isLoading ? "opacity-50" : ""}`}>
                    {data.content.map((order) => <OrderRow key={order.id} order={order} />)}
                </ul>
                <Pager page={page} totalPages={data.totalPages} onPage={goToPage} />
            </>
        );
    }

    const total = data?.totalElements;
    return (
        // isolate keeps the backdrop's -z-10 inside this page.
        <main className="relative isolate mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-16 pt-8 text-white">
            <FavoriteBackdrop />
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
                <p className="h-5 text-sm text-white/60">
                    {user && total !== undefined && `${total.toLocaleString()} ${total === 1 ? "order" : "orders"}`}
                </p>
            </header>
            {body}
        </main>
    );
}
