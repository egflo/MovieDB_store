'use client';

import React, { FormEvent, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "@/lib/firebase/AuthContext";
import { addPaymentMethod, setDefaultPaymentMethod } from "@/lib/api/payments";
import { stripePromise } from "@/lib/stripe";
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
    appearance: {
        theme: "night" as const,
        variables: {
            colorBackground: "#262626",
            colorText: "#ffffff",
            borderRadius: "12px",
            fontSizeBase: "14px",
        },
    },
};

function CardForm({ makeDefault, onAdded, onCancel }: { makeDefault: boolean; onAdded: () => void; onCancel: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const toast = useToast();
    const [pending, setPending] = useState(false);
    // Stripe's own messages ("Your card number is incomplete."), meant for users.
    const [message, setMessage] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!stripe || !elements || !user || pending) return;
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
            toast({ message: "Card added" });
            onAdded();
        } catch (e) {
            console.warn("Failed to add card", e);
            toast({ message: "Couldn’t add that card. Try again.", tone: "error" });
        } finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <PaymentElement options={{ layout: "tabs" }} />
            {message && <p role="alert" className="text-sm text-red-300">{message}</p>}
            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={!stripe || pending}
                    className="flex h-11 min-w-32 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-black transition-colors hover:bg-white/85 disabled:cursor-default disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                    {pending && <CircularProgress size={16} color="inherit" />}
                    {pending ? "Saving…" : "Save card"}
                </button>
                <button type="button" onClick={onCancel} className="cursor-pointer text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function AddCardForm(props: { makeDefault: boolean; onAdded: () => void; onCancel: () => void }) {
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
