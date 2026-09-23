'use client';

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import CreditCardOutlined from "@mui/icons-material/CreditCardOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import type { SvgIconComponent } from "@mui/icons-material";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useBookmarks } from "@/lib/context/BookmarkContext";
import { getOrders } from "@/lib/api/orders";
import { getAddresses } from "@/lib/api/addresses";
import { getPaymentMethods } from "@/lib/api/payments";
import { formatPrice } from "@/lib/api/client";
import { optimizedImage, optimizerUrl } from "@/lib/image";
import { GLASS_CARD } from "@/app/ui/glass";
import ProfileImage from "@/app/components/ProfileImage";
import { Logout } from "@/app/components/actions/Logout";
import ScrollZoomBackdrop from "@/app/components/ScrollZoomBackdrop";

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString()} ${n === 1 ? one : many}`;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const shortDate = (ms: number) =>
    new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

/** A section of the account: glass card linking to its page, with a live summary. */
function SectionCard({ href, title, Icon, children }: {
    href: string; title: string; Icon: SvgIconComponent; children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={`group flex items-center gap-4 rounded-2xl p-5 transition-colors hover:bg-white/[0.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${GLASS_CARD}`}
        >
            <Icon sx={{ fontSize: 28 }} className="shrink-0 self-start text-white/80" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h2 className="font-semibold">{title}</h2>
                <div className="flex min-h-10 flex-col gap-0.5 text-sm text-white/60">{children}</div>
            </div>
            <ChevronRightRoundedIcon className="shrink-0 text-white/40 transition-colors group-hover:text-white/80" />
        </Link>
    );
}

/** A card's summary: skeleton lines while loading, a quiet note if it failed. */
function Summary({ loading, error, children }: { loading: boolean; error: unknown; children: React.ReactNode }) {
    if (loading) {
        return (
            <>
                <span className="block h-4 w-40 animate-pulse rounded bg-white/10" />
                <span className="block h-4 w-28 animate-pulse rounded bg-white/10" />
            </>
        );
    }
    if (error) return <span>Couldn’t load this right now.</span>;
    return <>{children}</>;
}

function OrdersSummary({ token }: { token: string }) {
    // Same key as the Orders page, so each warms the other's cache.
    const { data, isLoading, error } = useSWR(["orders", token], ([, t]) => getOrders(t), { revalidateOnFocus: false });
    const latest = data?.content[0]; // newest first
    return (
        <Summary loading={isLoading} error={error}>
            {!data || data.totalElements === 0 || !latest ? (
                <span>No orders yet</span>
            ) : (
                <>
                    <span className="text-white/85">{plural(data.totalElements, "order")}</span>
                    <span>Latest {shortDate(latest.created)} · {formatPrice(latest.total)} · {capitalize(latest.status)}</span>
                </>
            )}
        </Summary>
    );
}

const POSTER_STRIP = 5;

function FavoritesSummary() {
    const { bookmarks, loading, error } = useBookmarks();
    const posters = bookmarks.map((b) => b.movie?.poster).filter(Boolean).slice(0, POSTER_STRIP) as string[];
    return (
        <Summary loading={loading} error={error}>
            {bookmarks.length === 0 ? (
                <span>No favorites yet</span>
            ) : (
                <>
                    <span className="text-white/85">{plural(bookmarks.length, "movie")}</span>
                    <span className="mt-1 flex gap-1.5" aria-hidden>
                        {posters.map((poster) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={poster} {...optimizedImage(poster, 64, 96)} alt=""
                                 className="h-12 w-8 rounded object-cover ring-1 ring-white/10" />
                        ))}
                    </span>
                </>
            )}
        </Summary>
    );
}

function AddressesSummary({ token }: { token: string }) {
    const { data, isLoading, error } = useSWR(["addresses", token], ([, t]) => getAddresses(t), { revalidateOnFocus: false });
    const addresses = data ?? [];
    const main = addresses.find((a) => a.isDefault) ?? addresses[0];
    return (
        <Summary loading={isLoading} error={error}>
            {!main ? (
                <span>No saved addresses</span>
            ) : (
                <>
                    <span className="truncate text-white/85">{[main.street, main.city, main.state].filter(Boolean).join(", ")}</span>
                    <span>{main.isDefault ? "Default" : "Saved"}{addresses.length > 1 ? ` · ${plural(addresses.length, "address", "addresses")}` : ""}</span>
                </>
            )}
        </Summary>
    );
}

function PaymentsSummary({ token }: { token: string }) {
    const { data, isLoading, error } = useSWR(["payment-methods", token], ([, t]) => getPaymentMethods(t), { revalidateOnFocus: false });
    const methods = data ?? [];
    const main = methods.find((m) => m.isDefault) ?? methods[0];
    const card = main && (main.card ?? main);
    return (
        <Summary loading={isLoading} error={error}>
            {!card ? (
                <span>No saved cards. One you use at checkout is saved here.</span>
            ) : (
                <>
                    <span className="text-white/85">{capitalize(card.brand)} •••• {card.last4}</span>
                    <span>{main.isDefault ? "Default" : "Saved"}{methods.length > 1 ? ` · ${plural(methods.length, "card")}` : ""}</span>
                </>
            )}
        </Summary>
    );
}

/**
 * The most recently saved favourite's backdrop behind the whole page, as a
 * heavily blurred colour wash (like the cast page), so the glass cards have
 * something to frost. Over the flat page background the blur had nothing to
 * show. None until favourites load, or if there are none.
 */
function AccountBackdrop() {
    const { bookmarks } = useBookmarks();
    const latest = [...bookmarks]
        .sort((a, b) => Date.parse(b.created) - Date.parse(a.created))
        .find((b) => b.movie?.background || b.movie?.poster);
    const image: string | undefined = latest && (latest.movie.background || latest.movie.poster);
    if (!image) return null;
    // Blurred this much, a 256px thumbnail looks the same as the original.
    return <ScrollZoomBackdrop src={optimizerUrl(image, 256) ?? image} />;
}

export default function Account() {
    const { user } = useAuth();

    if (!user) {
        return (
            <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 text-white">
                <p className="text-lg">
                    Please{" "}
                    <Link href="/login" className="underline">
                        sign in
                    </Link>{" "}
                    to view your account.
                </p>
            </main>
        );
    }

    const token = user.idToken;

    return (
        // isolate keeps the backdrop's -z-10 inside this page.
        <main className="relative isolate mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-8 text-white">
            <AccountBackdrop />
            <header className="flex flex-wrap items-center gap-4">
                <ProfileImage
                    name={user.displayName ?? user.email ?? "You"}
                    imageUrl={user.photoURL ?? undefined}
                    size={64}
                    className="rounded-full"
                />
                <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {user.displayName ?? "Your account"}
                    </h1>
                    <p className="truncate text-sm text-white/60">{user.email}</p>
                    {!user.emailVerified && (
                        <p className="text-xs text-amber-400">Email not verified</p>
                    )}
                </div>
                <Logout />
            </header>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SectionCard href="/user/orders" title="Orders" Icon={ReceiptLongOutlined}>
                    <OrdersSummary token={token} />
                </SectionCard>
                <SectionCard href="/user/favorites" title="Favorites" Icon={FavoriteBorderOutlined}>
                    <FavoritesSummary />
                </SectionCard>
                <SectionCard href="/user/address/info" title="Addresses" Icon={HomeOutlined}>
                    <AddressesSummary token={token} />
                </SectionCard>
                <SectionCard href="/user/payments" title="Payment methods" Icon={CreditCardOutlined}>
                    <PaymentsSummary token={token} />
                </SectionCard>
            </div>
        </main>
    );
}
