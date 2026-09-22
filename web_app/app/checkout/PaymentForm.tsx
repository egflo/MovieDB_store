'use client';

import React, { FormEvent, useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import Button from "@mui/material/Button";
import { Address } from "@/lib/models/Address";
import { Invoice } from "@/lib/models/Invoice";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import { createOrder } from "@/lib/api/orders";
import { formatPrice } from "@/lib/api/client";

export default function PaymentForm({
    invoice,
    address,
    onComplete,
}: {
    invoice: Invoice;
    address: Address;
    onComplete: (orderId: string | number) => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const { refresh: refreshCart } = useCart();

    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!stripe || !elements || !user || pending) return;

        setPending(true);
        setError(null);

        // redirect: "if_required" keeps the happy path inline; only payment
        // methods that demand a redirect will navigate away.
        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });

        if (stripeError) {
            setError(stripeError.message ?? "Payment failed");
            setPending(false);
            return;
        }

        if (paymentIntent?.status !== "succeeded") {
            setError(`Payment did not complete (${paymentIntent?.status ?? "unknown"})`);
            setPending(false);
            return;
        }

        // Payment cleared. Record the order against our own database — Stripe is
        // not the system of record for fulfilment state.
        try {
            const order = await createOrder(user.idToken, {
                userId: user.uid,
                paymentId: invoice.paymentSheet.paymentIntentId,
                address: {
                    firstName: address.firstName,
                    lastName: address.lastName,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    postcode: address.postcode,
                    country: address.country,
                },
                shipping: invoice.shipping,
                subTotal: invoice.subTotal,
                tax: invoice.tax,
                total: invoice.total,
                items: invoice.items.map((i) => ({
                    itemId: i.itemId,
                    quantity: i.quantity,
                    price: i.price,
                    name: i.name,
                    imageUrl: i.image,
                    description: i.description,
                    sku: i.sku,
                })),
            });

            await refreshCart();
            onComplete(order.id);
        } catch {
            // The charge succeeded but our record did not save. Say so plainly
            // rather than implying the payment failed.
            setError(
                "Your payment went through, but we could not save the order. " +
                    "Please contact support before trying again.",
            );
            setPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <PaymentElement />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!stripe || pending}
            >
                {pending ? "Processing…" : `Pay ${formatPrice(invoice.total)}`}
            </Button>
        </form>
    );
}
