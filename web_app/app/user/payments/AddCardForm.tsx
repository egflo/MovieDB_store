'use client';

import React, { FormEvent, useEffect, useRef, useState } from "react";
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

/**
 * Stand-in for Stripe's fields while its iframe loads, laid over it: the
 * panel used to sit empty with Save live, then jump as the fields arrived.
 * Same rows as the real form (card, expiry, CVC / country, ZIP / terms).
 */
function FieldsSkeleton() {
    const bar = "animate-pulse rounded-xl bg-white/10";
    return (
        <div aria-hidden className="grid grid-cols-4 gap-3">
            {/* Stacked like Stripe's fields on phones; one row from sm up. */}
            {["col-span-4 sm:col-span-2", "col-span-2 sm:col-span-1", "col-span-2 sm:col-span-1", "col-span-4 sm:col-span-2", "col-span-4 sm:col-span-2"].map((span, n) => (
                <div key={n} className={`flex flex-col gap-1.5 ${span}`}>
                    <span className={`h-3.5 w-20 ${bar}`} />
                    <span className={`h-11 ${bar}`} />
                </div>
            ))}
            <span className={`col-span-4 mt-1 h-3 ${bar}`} />
            <span className={`col-span-3 h-3 ${bar}`} />
        </div>
    );
}

/**
 * The Payment Element's height with this layout (cards only, US): 344px with
 * its fields stacked on phones, 189px in rows from sm up (measured). While it
 * loads the box is exactly this tall and clips (Stripe's own 210px loader
 * would otherwise push the panel taller, then shrink it); once ready it's a
 * minimum, so nothing moves.
 */
const FIELDS_LOADING = "h-[344px] sm:h-[189px] overflow-hidden";
const FIELDS_READY = "min-h-[344px] sm:min-h-[189px]";

type Props = { makeDefault: boolean; onAdded: () => Promise<void> | void; onCancel: () => void };

function CardForm({ makeDefault, onAdded, onCancel }: Props) {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const toast = useToast();
    const [pending, setPending] = useState(false);
    // Stripe's iframe takes a moment (longer on first load): until it reports
    // ready, show placeholders and keep Save disabled.
    const [ready, setReady] = useState(false);
    // Stripe removes its own loader a moment after "ready"; keep the box
    // clipped until then, or the panel blips taller for a frame.
    const [settled, setSettled] = useState(false);
    const fieldsRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!ready) return;
        let frame = 0;
        const started = performance.now();
        const check = () => {
            const loading = fieldsRef.current?.querySelector(".__PrivateStripeElementLoader");
            if (!loading || performance.now() - started > 2000) setSettled(true);
            else frame = requestAnimationFrame(check);
        };
        check();
        return () => cancelAnimationFrame(frame);
    }, [ready]);
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
            {/* The element stays in the layout while it loads (a display:none
                iframe measures 0 and resizes only once shown), transparent
                under the placeholder, and fades in when Stripe says it's ready. */}
            <div ref={fieldsRef} className={`relative ${settled ? FIELDS_READY : FIELDS_LOADING}`}>
                <div className={`transition-opacity duration-200 ${ready ? "opacity-100" : "opacity-0"}`}>
                    <PaymentElement options={{ layout: "tabs" }} onReady={() => setReady(true)} />
                </div>
                {!ready && <div className="absolute inset-0"><FieldsSkeleton /></div>}
            </div>
            {message && <p role="alert" className="text-sm text-red-300">{message}</p>}
            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={!stripe || !ready || pending}
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
