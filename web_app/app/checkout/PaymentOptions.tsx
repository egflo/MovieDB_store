'use client';

import React, { MutableRefObject, useEffect, useMemo } from "react";
import { Elements, useElements } from "@stripe/react-stripe-js";
import type { StripeElements } from "@stripe/stripe-js";
import CreditCardOutlined from "@mui/icons-material/CreditCardOutlined";
import { PaymentMethod } from "@/lib/models/PaymentMethod";
import { STRIPE_APPEARANCE, stripePromise } from "@/lib/stripe";
import StripeFields from "@/app/ui/StripeFields";
import { cardName, expiry, isExpired } from "@/app/user/payments/cards";
import { DEFAULT_PILL, OPTION, RADIO } from "./option";

/** The "New card" choice; any other value is a saved payment method's id. */
export const NEW_CARD = "new";

/**
 * The Payment Element's height here, narrow / mid / wide (see StripeFields):
 * payment mode shows no terms line. Measured.
 */
const FIELDS_HEIGHTS: [number, number, number] = [262, 194, 126];

/** The first saved card that isn't expired, the default if it qualifies; else a new card. */
export function initialChoice(methods: PaymentMethod[]) {
    const usable = methods.filter((m) => !isExpired((m.card ?? m).exp_month, (m.card ?? m).exp_year));
    return (usable.find((m) => m.isDefault) ?? usable[0])?.id ?? NEW_CARD;
}

/** Hands the Elements instance up to checkout, whose Pay button lives outside <Elements>. */
function ElementsBridge({ into }: { into: MutableRefObject<StripeElements | null> }) {
    const elements = useElements();
    useEffect(() => {
        into.current = elements;
        return () => { into.current = null; };
    }, [elements, into]);
    return null;
}

function CardsSkeleton() {
    const bar = "animate-pulse rounded bg-white/10";
    return (
        <div aria-busy="true" aria-label="Loading saved cards" className="flex flex-col gap-3">
            {[0, 1].map((n) => (
                <div key={n} className="flex items-center gap-3 rounded-xl p-4 ring-1 ring-inset ring-white/10">
                    <span className={`h-4 w-4 rounded-full ${bar}`} />
                    <span className={`h-4 w-44 ${bar}`} />
                </div>
            ))}
        </div>
    );
}

/**
 * How to pay: saved cards as radio tiles (default first, expired ones
 * disabled) and "New card", which shows Stripe's fields. Those run in
 * deferred mode with manual payment-method creation, like Add card: they
 * don't need the invoice's PaymentIntent, so they load straight away and
 * survive a change of address (which makes a new intent). Checkout then
 * confirms the intent with the chosen or new card's id.
 */
export default function PaymentOptions({
    labelledBy, methods, loading, value, onChange, amount, elementsRef, onFieldsReady, saveCard, onSaveCardChange, disabled,
}: {
    labelledBy: string;
    methods: PaymentMethod[];
    loading: boolean;
    value: string | null;
    onChange: (value: string) => void;
    /** For Stripe's display only; the charge is the invoice's intent. */
    amount: number;
    elementsRef: MutableRefObject<StripeElements | null>;
    onFieldsReady: () => void;
    saveCard: boolean;
    onSaveCardChange: (save: boolean) => void;
    disabled: boolean;
}) {
    const options = useMemo(() => ({
        mode: "payment" as const,
        amount,
        currency: "usd",
        paymentMethodCreation: "manual" as const,
        paymentMethodTypes: ["card"],
        appearance: STRIPE_APPEARANCE,
    }), [amount]);

    if (loading) return <CardsSkeleton />;

    const sorted = [...methods].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    return (
        <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-col gap-3">
            {sorted.map((m) => {
                const card = m.card ?? m;
                const expired = isExpired(card.exp_month, card.exp_year);
                const exp = expiry(card.exp_month, card.exp_year);
                return (
                    <label key={m.id} className={`${OPTION} items-center`}>
                        <input
                            type="radio"
                            name="payment-method"
                            value={m.id}
                            className={`${RADIO} mt-0`}
                            checked={value === m.id}
                            disabled={disabled || expired}
                            onChange={() => onChange(m.id)}
                        />
                        <CreditCardOutlined sx={{ fontSize: 22 }} className="text-white/80" />
                        <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 text-sm">
                            <span className="font-semibold">{cardName(m)}</span>
                            {exp && (
                                <span className={expired ? "text-amber-300" : "text-white/60"}>
                                    {expired ? `Expired ${exp}` : `Expires ${exp}`}
                                </span>
                            )}
                        </span>
                        {m.isDefault && <span className={DEFAULT_PILL}>Default</span>}
                    </label>
                );
            })}

            <div className={`${OPTION} cursor-default flex-col items-stretch has-[:checked]:hover:bg-white/[0.12]`}>
                <label className="flex cursor-pointer items-center gap-3">
                    <input
                        type="radio"
                        name="payment-method"
                        value={NEW_CARD}
                        className={`${RADIO} mt-0`}
                        checked={value === NEW_CARD}
                        disabled={disabled}
                        onChange={() => onChange(NEW_CARD)}
                    />
                    <CreditCardOutlined sx={{ fontSize: 22 }} className="text-white/80" />
                    <span className="text-sm font-semibold">{methods.length ? "New card" : "Card"}</span>
                </label>

                {value === NEW_CARD && (
                    stripePromise ? (
                        <div className="flex flex-col gap-4 pt-2">
                            <Elements stripe={stripePromise} options={options}>
                                <ElementsBridge into={elementsRef} />
                                <StripeFields heights={FIELDS_HEIGHTS} onReady={onFieldsReady} />
                            </Elements>
                            <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-white/80">
                                <input
                                    type="checkbox"
                                    className="size-4 cursor-pointer accent-white"
                                    checked={saveCard}
                                    disabled={disabled}
                                    onChange={(e) => onSaveCardChange(e.target.checked)}
                                />
                                Save this card for next time
                            </label>
                        </div>
                    ) : (
                        <p className="pt-2 text-sm text-white/60">
                            Card payments are unavailable: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY isn’t set in web_app/.env.
                        </p>
                    )
                )}
            </div>
        </div>
    );
}
