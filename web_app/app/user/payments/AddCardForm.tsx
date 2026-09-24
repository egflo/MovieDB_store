'use client';

import React, { FormEvent, useState } from "react";
import { Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import Spinner from "@/app/ui/Spinner";
import StripeFields from "@/app/ui/StripeFields";
import { useAuth } from "@/lib/firebase/AuthContext";
import { addPaymentMethod, setDefaultPaymentMethod } from "@/lib/api/payments";
import { STRIPE_APPEARANCE, stripePromise } from "@/lib/stripe";
import { useToast } from "@/app/components/Toast";

/**
 * Stripe's Payment Element in deferred "setup" mode, cards only: it creates a
 * payment method in the browser (card details never reach our servers), then
 * order_service attaches it to the user's Stripe customer (PUT
 * /payment-methods/{id}). There's no SetupIntent endpoint, so the card isn't
 * checked with the bank until it's used.
 */
const OPTIONS = {
    mode: "setup" as const,
    currency: "usd",
    paymentMethodCreation: "manual" as const,
    paymentMethodTypes: ["card"],
    appearance: STRIPE_APPEARANCE,
};

/**
 * The Payment Element's height with this layout, narrow / mid / wide (see
 * StripeFields), including the terms Stripe shows in setup mode. Measured.
 */
const FIELDS_HEIGHTS: [number, number, number] = [344, 276, 189];

type Props = { makeDefault: boolean; onAdded: () => Promise<void> | void; onCancel: () => void };

function CardForm({ makeDefault, onAdded, onCancel }: Props) {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const toast = useToast();
    const [pending, setPending] = useState(false);
    // Until Stripe's fields report ready, keep Save disabled.
    const [ready, setReady] = useState(false);
    // Stripe's own messages ("Your card number is incomplete."), meant for users.
    const [message, setMessage] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!stripe || !elements || !user || !ready || pending) return;
        setPending(true);
        setMessage(null);
        try {
            const { error: invalid } = await elements.submit();
            if (invalid) {
                setMessage(invalid.message ?? "Check the card details.");
                return;
            }
            const { error, paymentMethod } = await stripe.createPaymentMethod({ elements });
            if (error || !paymentMethod) {
                setMessage(error?.message ?? "Couldn’t read that card.");
                return;
            }
            await addPaymentMethod(user.idToken, paymentMethod.id);
            // The first card becomes the default, so checkout has one.
            if (makeDefault) await setDefaultPaymentMethod(user.idToken, paymentMethod.id);
            // Stay on "Saving…" until the list has the new card, so the form
            // doesn't close onto the old list (or "No saved cards yet").
            await onAdded();
            toast({ message: "Card added" });
        } catch (e) {
            console.warn("Failed to add card", e);
            toast({ message: "Couldn’t add that card. Try again.", tone: "error" });
        } finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <StripeFields heights={FIELDS_HEIGHTS} terms onReady={() => setReady(true)} />
            {message && <p role="alert" className="text-sm text-red-300">{message}</p>}
            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={!stripe || !ready || pending}
                    className="flex h-11 min-w-32 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-black transition-colors hover:bg-white/85 disabled:cursor-default disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                    {pending && <Spinner />}
                    {pending ? "Saving…" : "Save card"}
                </button>
                <button type="button" onClick={onCancel} className="cursor-pointer text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function AddCardForm(props: Props) {
    if (!stripePromise) {
        return (
            <p className="text-sm text-white/60">
                Adding cards is unavailable: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY isn’t set in web_app/.env.
            </p>
        );
    }
    return (
        <Elements stripe={stripePromise} options={OPTIONS}>
            <CardForm {...props} />
        </Elements>
    );
}
