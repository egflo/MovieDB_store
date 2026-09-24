'use client';

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Spinner from "@/app/ui/Spinner";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import { getAddresses } from "@/lib/api/addresses";
import { getInvoiceFor } from "@/lib/api/orders";
import { formatPrice } from "@/lib/api/client";
import { Address } from "@/lib/models/Address";
import AddressSelector from "./AddressSelector";
import PaymentForm from "./PaymentForm";


export default function Checkout() {
    const { user } = useAuth();
    const { items } = useCart();
    const router = useRouter();
    const [selected, setSelected] = useState<Address | null>(null);

    const { data: addresses, isLoading: addressesLoading } = useSWR(
        user ? ["addresses", user.idToken] : null,
        ([, token]) => getAddresses(token),
        { revalidateOnFocus: false },
    );

    // Default to the address marked default, else the first one.
    useEffect(() => {
        if (!selected && addresses?.length) {
            setSelected(addresses.find((a) => a.isDefault) ?? addresses[0]);
        }
    }, [addresses, selected]);

    // The invoice is rebuilt per address because Stripe Tax depends on it.
    const {
        data: invoice,
        isLoading: invoiceLoading,
        error: invoiceError,
    } = useSWR(
        user && selected ? ["invoice", selected.id, user.idToken] : null,
        () => getInvoiceFor(user!.idToken, selected!),
        { revalidateOnFocus: false },
    );

    const elementsOptions = useMemo(
        () =>
            invoice?.paymentSheet?.paymentIntent
                ? { clientSecret: invoice.paymentSheet.paymentIntent }
                : undefined,
        [invoice],
    );

    if (!user) {
        return (
            <div className="p-6">
                <p className="text-lg">
                    Please{" "}
                    <Link href="/login" className="underline">
                        sign in
                    </Link>{" "}
                    to check out.
                </p>
            </div>
        );
    }

    if (!stripePromise) {
        return (
            <div className="p-6">
                <p className="text-red-500">
                    Checkout is unavailable: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not
                    set.
                </p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col gap-3 p-6">
                <h1 className="text-xl font-medium">Your cart is empty</h1>
                <Link href="/" className="underline">
                    Browse movies
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:flex-row md:items-start">
            <div className="flex w-full flex-col gap-6 md:w-3/5">
                <section className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">Shipping address</h2>
                    {addressesLoading ? (
                        <Spinner size={24} label="Loading addresses" />
                    ) : (
                        <AddressSelector
                            addresses={addresses ?? []}
                            selectedId={selected?.id}
                            onSelect={setSelected}
                        />
                    )}
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">Payment</h2>

                    {!selected ? (
                        <p className="text-sm text-gray-500">
                            Choose a shipping address first.
                        </p>
                    ) : invoiceLoading ? (
                        <Spinner size={24} label="Preparing payment" />
                    ) : invoiceError || !invoice ? (
                        <p className="text-sm text-red-500">
                            Could not prepare your payment.
                        </p>
                    ) : elementsOptions ? (
                        <Elements
                            stripe={stripePromise}
                            options={elementsOptions}
                            // Remount Elements when the intent changes.
                            key={invoice.paymentSheet.paymentIntentId}
                        >
                            <PaymentForm
                                invoice={invoice}
                                address={selected}
                                onComplete={(orderId) =>
                                    router.push(`/user/order/${orderId}`)
                                }
                            />
                        </Elements>
                    ) : null}
                </section>
            </div>

            <div className="w-full md:sticky md:top-4 md:w-2/5">
                <Card>
                    <CardContent className="flex flex-col gap-2">
                        <h2 className="text-lg font-medium">Order summary</h2>

                        {invoice ? (
                            <>
                                {invoice.items.map((i) => (
                                    <div
                                        key={i.id ?? i.itemId}
                                        className="flex justify-between text-sm"
                                    >
                                        <span className="text-gray-500">
                                            {i.name} × {i.quantity}
                                        </span>
                                        <span>{formatPrice(i.price * i.quantity)}</span>
                                    </div>
                                ))}

                                <Divider className="my-1" />

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span>{formatPrice(invoice.subTotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Shipping</span>
                                    <span>{formatPrice(invoice.shipping)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tax</span>
                                    <span>{formatPrice(invoice.tax)}</span>
                                </div>

                                <Divider className="my-1" />

                                <div className="flex justify-between text-base font-medium">
                                    <span>Total</span>
                                    <span>{formatPrice(invoice.total)}</span>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-gray-500">
                                Select an address to see totals.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
