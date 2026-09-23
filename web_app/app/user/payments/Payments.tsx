'use client';

import React, { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CreditCardOutlined from "@mui/icons-material/CreditCardOutlined";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getPaymentMethods, setDefaultPaymentMethod, deletePaymentMethod } from "@/lib/api/payments";
import { PaymentMethod } from "@/lib/models/PaymentMethod";
import { useToast } from "@/app/components/Toast";
import { GLASS_CARD } from "@/app/ui/glass";
import { CHIP, CHIP_ICON_SIZE } from "@/app/ui/chip";
import FavoriteBackdrop from "@/app/ui/FavoriteBackdrop";
import AddCardForm from "./AddCardForm";
import { brandName, expiry, isExpired } from "./cards";

const PANEL = `rounded-2xl p-5 ${GLASS_CARD}`;
const CARD = `flex flex-col gap-4 ${PANEL}`;
const ACTION = "cursor-pointer text-sm text-white/70 transition-colors hover:text-white disabled:cursor-default disabled:opacity-40 disabled:hover:text-white/70";

function PaymentsSkeleton() {
    const bar = "animate-pulse rounded bg-white/10";
    return (
        <ul aria-busy="true" aria-label="Loading payment methods" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1].map((n) => (
                <li key={n} className={CARD}>
                    <div className="flex items-center gap-3">
                        <span className={`h-7 w-7 ${bar}`} />
                        <div className="flex flex-col gap-2">
                            <span className={`h-4 w-36 ${bar}`} />
                            <span className={`h-3.5 w-24 ${bar}`} />
                        </div>
                    </div>
                    <span className={`h-3.5 w-32 ${bar}`} />
                </li>
            ))}
        </ul>
    );
}

function CardTile({ method, busy, onMakeDefault, onRemove }: {
    method: PaymentMethod; busy: string | null; onMakeDefault: () => void; onRemove: () => void;
}) {
    // Removing detaches the card from Stripe; it can't be undone without
    // typing the card in again, so it asks first (inline, no dialog).
    const [confirming, setConfirming] = useState(false);
    const card = method.card ?? method;
    const expired = isExpired(card.exp_month, card.exp_year);
    const exp = expiry(card.exp_month, card.exp_year);
    const name = `${brandName(card.brand)} •••• ${card.last4}`;

    return (
        <li className={`${CARD} transition-opacity ${busy === method.id ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <CreditCardOutlined sx={{ fontSize: 28 }} className="text-white/80" />
                    <div className="flex flex-col">
                        <p className="font-semibold">{name}</p>
                        <p className="text-sm text-white/60">
                            {exp && (expired ? <span className="text-amber-300">Expired {exp}</span> : `Expires ${exp}`)}
                            {card.funding && card.funding !== "unknown" && ` · ${card.funding.charAt(0).toUpperCase()}${card.funding.slice(1)}`}
                        </p>
                    </div>
                </div>
                {method.isDefault && (
                    <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/85 ring-1 ring-inset ring-white/15">
                        Default
                    </span>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-3">
                {confirming ? (
                    <>
                        <span className="text-sm text-white/80">Remove this card?</span>
                        <button type="button" className={`${ACTION} font-semibold text-red-300 hover:text-red-200`} disabled={busy !== null}
                                onClick={() => { setConfirming(false); onRemove(); }}>
                            Remove
                        </button>
                        <button type="button" className={ACTION} onClick={() => setConfirming(false)}>Keep</button>
                    </>
                ) : (
                    <>
                        {!method.isDefault && (
                            <button type="button" className={ACTION} disabled={busy !== null} onClick={onMakeDefault}>
                                Make default
                            </button>
                        )}
                        <button type="button" className={`${ACTION} ml-auto hover:text-red-300`} disabled={busy !== null}
                                onClick={() => setConfirming(true)} aria-label={`Remove ${name}`}>
                            Remove
                        </button>
                    </>
                )}
            </div>
        </li>
    );
}

export default function Payments() {
    const { user } = useAuth();
    const toast = useToast();
    const [busy, setBusy] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);

    // Same key as the account page's Payment methods card.
    const { data, isLoading, error: loadError, mutate } = useSWR(
        user ? ["payment-methods", user.idToken] : null,
        ([, token]) => getPaymentMethods(token),
        { revalidateOnFocus: false },
    );

    async function act(id: string, fn: (token: string, id: string) => Promise<unknown>, done: string, failure: string) {
        if (!user || busy) return;
        setBusy(id);
        try {
            await fn(user.idToken, id);
            toast({ message: done });
        } catch (e) {
            console.warn(failure, e);
            toast({ message: `${failure}. Try again.`, tone: "error" });
        } finally {
            await mutate();
            setBusy(null);
        }
    }

    // The default first.
    const methods = [...(data ?? [])].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    const addButton = (
        <button type="button" onClick={() => setAdding(true)} className={`${CHIP} cursor-pointer pl-2.5 pr-3.5`}>
            <AddRoundedIcon sx={CHIP_ICON_SIZE} /> Add card
        </button>
    );

    let body: React.ReactNode;
    if (!user) {
        body = <p className="py-10 text-white/70">Please <Link href="/login" className="underline">sign in</Link> to manage your payment methods.</p>;
    } else if (isLoading) {
        body = <PaymentsSkeleton />;
    } else if (loadError) {
        body = <p className="py-10 text-white/60">Couldn’t load your payment methods. Try again in a moment.</p>;
    } else if (methods.length === 0) {
        // Checkout doesn't save the card it charges, so this is the only way
        // a card gets here. (The old text promised checkout would.)
        body = !adding && (
            <div className="flex flex-col items-start gap-3 py-10">
                <p className="text-white/70">No saved cards yet. Add one to keep it on file.</p>
                {addButton}
            </div>
        );
    } else {
        body = (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {methods.map((m) => (
                    <CardTile
                        key={m.id}
                        method={m}
                        busy={busy}
                        onMakeDefault={() => act(m.id, setDefaultPaymentMethod, "Default card updated", "Couldn’t change your default card")}
                        onRemove={() => act(m.id, deletePaymentMethod, "Card removed", "Couldn’t remove that card")}
                    />
                ))}
            </ul>
        );
    }

    return (
        // isolate keeps the backdrop's -z-10 inside this page.
        <main className="relative isolate mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-16 pt-8 text-white">
            <FavoriteBackdrop />
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-semibold tracking-tight">Payment methods</h1>
                    <p className="h-5 text-sm text-white/60">
                        {user && methods.length > 0 && `${methods.length} saved`}
                    </p>
                </div>
                {user && methods.length > 0 && !adding && addButton}
            </header>

            {adding && (
                <section aria-label="Add a card" className={`flex max-w-2xl flex-col gap-4 ${PANEL}`}>
                    <h2 className="text-lg font-semibold">Add a card</h2>
                    <AddCardForm
                        makeDefault={!methods.some((m) => m.isDefault)}
                        onAdded={() => { setAdding(false); mutate(); }}
                        onCancel={() => setAdding(false)}
                    />
                </section>
            )}
            {body}
        </main>
    );
}
