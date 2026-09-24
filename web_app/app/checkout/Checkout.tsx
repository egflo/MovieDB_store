'use client';

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import type { StripeElements } from "@stripe/stripe-js";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import LockOutlined from "@mui/icons-material/LockOutlined";
import { stripePromise } from "@/lib/stripe";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import { addressesKey, getAddresses } from "@/lib/api/addresses";
import { createOrder, getInvoiceFor } from "@/lib/api/orders";
import { addPaymentMethod, getPaymentMethods, setDefaultPaymentMethod } from "@/lib/api/payments";
import { MAX_PER_TITLE, deleteCartItem } from "@/lib/api/cart";
import { formatPrice } from "@/lib/api/client";
import { Cart } from "@/lib/models/Cart";
import { Invoice } from "@/lib/models/Invoice";
import { useToast } from "@/app/components/Toast";
import { GLASS_CARD } from "@/app/ui/glass";
import { CHIP, CHIP_ICON_SIZE } from "@/app/ui/chip";
import FavoriteBackdrop from "@/app/ui/FavoriteBackdrop";
import PosterThumb from "@/app/ui/PosterThumb";
import Spinner from "@/app/ui/Spinner";
import { cardName } from "@/app/user/payments/cards";
import AddressSelector from "./AddressSelector";
import PaymentOptions, { NEW_CARD, initialChoice } from "./PaymentOptions";

const PANEL = `rounded-2xl p-5 ${GLASS_CARD}`;

/**
 * order_service's invoice adds a flat $5.00 shipping (StripeService's tax
 * calculation). Shown before the invoice arrives; the invoice's own figure
 * replaces it.
 */
const SHIPPING = 500;

const BAR = "inline-block animate-pulse rounded bg-white/10";

function Row({ label, children, strong = false }: { label: string; children: React.ReactNode; strong?: boolean }) {
    return (
        <div className={`flex items-center justify-between gap-4 ${strong ? "border-t border-white/10 pt-2 text-base font-semibold" : "text-sm"}`}>
            <dt className={strong ? undefined : "text-white/60"}>{label}</dt>
            <dd>{children}</dd>
        </div>
    );
}

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
    return (
        <section aria-labelledby={`step-${step}`} className={`flex flex-col gap-4 ${PANEL}`}>
            <h2 id={`step-${step}`} className="flex items-center gap-2.5 text-lg font-semibold">
                <span aria-hidden className="flex size-6 items-center justify-center rounded-full bg-white/10 text-xs ring-1 ring-inset ring-white/15">
                    {step}
                </span>
                {title}
            </h2>
            {children}
        </section>
    );
}

function CheckoutSkeleton() {
    return (
        <div aria-busy="true" aria-label="Loading checkout" className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_340px] md:items-start">
            <div className="flex flex-col gap-4">
                <div className={`h-52 ${PANEL}`} />
                <div className={`h-44 ${PANEL}`} />
            </div>
            <div className={`h-80 ${PANEL}`} />
        </div>
    );
}

/** What was paid for, kept once the charge succeeds: the cart empties behind it. */
type Receipt = { invoice: Invoice; items: Cart[] };

export default function Checkout() {
    const { user } = useAuth();
    const { items: cartItems, count: cartCount, subtotal: cartSubtotal, loading: cartLoading, error: cartError, refresh: refreshCart } = useCart();
    const { mutate } = useSWRConfig();
    const router = useRouter();
    const toast = useToast();

    const [addressId, setAddressId] = useState<string | null>(null);
    const [choice, setChoice] = useState<string | null>(null);
    const [saveCard, setSaveCard] = useState(false);
    const [fieldsReady, setFieldsReady] = useState(false);
    const elementsRef = useRef<StripeElements | null>(null);
    const [pending, setPending] = useState<"paying" | "placing" | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [receipt, setReceipt] = useState<Receipt | null>(null);

    const token = user?.idToken;
    const addressesQuery = useSWR(token ? addressesKey(token) : null, ([, t]) => getAddresses(t), { revalidateOnFocus: false });
    // Same key as the Payment methods page and the account card.
    const methodsQuery = useSWR(token ? ["payment-methods", token] : null, ([, t]) => getPaymentMethods(t), { revalidateOnFocus: false });

    const addresses = addressesQuery.data ?? [];
    const address =
        addresses.find((a) => a.id === addressId) ?? addresses.find((a) => a.isDefault) ?? addresses[0];
    const methods = methodsQuery.data ?? [];
    // A failed card list still leaves a new card to pay with.
    const methodsSettled = !!methodsQuery.data || !!methodsQuery.error;
    const payWith = choice ?? (methodsSettled ? initialChoice(methods) : null);

    // Once paid, show what was paid for: the cart empties before we navigate.
    const items = receipt?.items ?? cartItems;

    // The invoice (Stripe Tax needs the address) also creates the
    // PaymentIntent. It's keyed on the cart's lines too, so a cart changed in
    // another tab can't be charged at the old total.
    const cartKey = cartItems.map((i) => `${i.id}:${i.quantity}`).join(",");
    const invoiceQuery = useSWR(
        token && address && cartItems.length && !receipt ? ["invoice", address.id, cartKey, token] : null,
        ([, , , t]) => getInvoiceFor(t, address!),
        { revalidateOnFocus: false },
    );
    const invoice = receipt?.invoice ?? invoiceQuery.data;
    const invoiceLoading = !receipt && invoiceQuery.isLoading;

    const overLimit = items.filter((i) => i.quantity > MAX_PER_TITLE);
    const busy = pending !== null || receipt !== null;
    const canPay = !!invoice && !invoiceLoading && !!address && !!payWith && !busy && overLimit.length === 0
        && (payWith !== NEW_CARD || fieldsReady);
    const chosenCard = methods.find((m) => m.id === payWith);

    function choose(value: string) {
        setChoice(value);
        setMessage(null);
        // The fields remount when "New card" comes back.
        if (value !== NEW_CARD) setFieldsReady(false);
    }

    /** The payment method to charge: the saved card's id, or a new one made from Stripe's fields. */
    async function paymentMethodId(): Promise<string | null> {
        if (payWith !== NEW_CARD) return payWith;
        const stripe = await stripePromise;
        const elements = elementsRef.current;
        if (!stripe || !elements) return null;
        const { error: invalid } = await elements.submit();
        if (invalid) {
            setMessage(invalid.message ?? "Check the card details.");
            return null;
        }
        const { error, paymentMethod } = await stripe.createPaymentMethod({ elements });
        if (error || !paymentMethod) {
            setMessage(error?.message ?? "Couldn’t read that card.");
            return null;
        }
        if (saveCard) {
            // Attached before paying, so the intent (made for the same Stripe
            // customer) can use it either way. A failure here shouldn't stop
            // the purchase.
            try {
                await addPaymentMethod(token!, paymentMethod.id);
                // The first card becomes the default, as on the Payment methods page.
                if (methods.length === 0) await setDefaultPaymentMethod(token!, paymentMethod.id);
                void mutate(["payment-methods", token]);
            } catch (e) {
                console.warn("Failed to save card at checkout", e);
                toast({ message: "Couldn’t save the card. Paying without saving it.", tone: "error" });
            }
        }
        return paymentMethod.id;
    }

    async function pay() {
        if (!user || !invoice || !address || !canPay) return;
        const stripe = await stripePromise;
        if (!stripe) return;
        // The invoice being paid, even if SWR swaps in another meanwhile.
        const paying = invoice;
        const paidItems = cartItems;
        setPending("paying");
        setMessage(null);

        try {
            const pm = await paymentMethodId();
            if (!pm) return;
            // Handles 3-D Secure in Stripe's own dialog; cards only, so no redirects.
            const { error, paymentIntent } = await stripe.confirmCardPayment(paying.paymentSheet.paymentIntent, { payment_method: pm });
            if (error) {
                setMessage(error.message ?? "The payment didn’t go through. Try again.");
                return;
            }
            if (paymentIntent?.status !== "succeeded") {
                setMessage(`The payment didn’t complete (${paymentIntent?.status ?? "unknown status"}). You haven’t been charged.`);
                return;
            }
        } catch (e) {
            console.warn("Payment failed", e);
            setMessage("The payment didn’t go through. Try again.");
            return;
        } finally {
            setPending((p) => (p === "paying" ? null : p));
        }

        // Charged. From here Pay stays disabled: trying again would charge twice.
        setReceipt({ invoice: paying, items: paidItems });
        setPending("placing");
        try {
            // Our own record of the order; Stripe isn't the system of record for fulfilment.
            const order = await createOrder(user.idToken, {
                userId: user.uid,
                paymentId: paying.paymentSheet.paymentIntentId,
                address: {
                    firstName: address.firstName,
                    lastName: address.lastName,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    postcode: address.postcode,
                    country: address.country,
                },
                shipping: paying.shipping,
                subTotal: paying.subTotal,
                tax: paying.tax,
                total: paying.total,
                items: paying.items.map((i) => ({
                    itemId: i.itemId,
                    quantity: i.quantity,
                    price: i.price,
                    name: i.name,
                    imageUrl: i.image,
                    // order_service keeps only `description` and the order pages
                    // show it as the title. The cart's own description is the
                    // IMDb id (also sent as `sku`), so send the title.
                    description: i.name,
                    sku: i.sku,
                })),
            });
            // Nothing on the server empties the cart after an order, so
            // remove the lines just paid for (stock was taken when they were
            // added). A failure here leaves the order placed.
            const cleared = await Promise.allSettled(paidItems.map((i) => deleteCartItem(user.idToken, i.id)));
            if (cleared.some((r) => r.status === "rejected")) {
                console.warn("Order placed but the cart wasn't fully cleared", cleared);
                toast({ message: "Order placed, but some items are still in your cart. You can remove them there.", tone: "error" });
            }
            router.push(`/user/order/${order.id}?placed=1`);
            // The order list and the account card's summary.
            void mutate((key) => Array.isArray(key) && key[0] === "orders");
            void refreshCart();
        } catch (e) {
            console.warn("Payment succeeded but the order wasn't saved", e);
            setMessage("Your payment went through, but we couldn’t save the order. Please contact support before trying again.");
            setPending(null);
        }
    }

    let body: React.ReactNode;
    if (!user) {
        body = <p className="py-10 text-white/70">Please <Link href="/login" className="underline">sign in</Link> to check out.</p>;
    } else if (!stripePromise) {
        body = <p className="py-10 text-white/60">Checkout is unavailable: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY isn’t set in web_app/.env.</p>;
    } else if (cartLoading && !receipt) {
        body = <CheckoutSkeleton />;
    } else if (cartError && !receipt) {
        body = <p className="py-10 text-white/60">Couldn’t load your cart. Try again in a moment.</p>;
    } else if (items.length === 0) {
        body = (
            <div className="flex flex-col items-start gap-3 py-10">
                <p className="text-white/70">Your cart is empty.</p>
                <Link href="/search" className={`${CHIP} px-4`}>Browse movies</Link>
            </div>
        );
    } else {
        const count = receipt ? receipt.items.reduce((n, i) => n + i.quantity, 0) : cartCount;
        const subtotal = invoice?.subTotal ?? cartSubtotal;
        const shipping = invoice?.shipping ?? SHIPPING;
        const amount = invoice?.total ?? subtotal + shipping;
        const taxPending = !!address && invoiceLoading;

        body = (
            // grid-cols-1 on phones so long titles truncate instead of widening the page.
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_340px] md:items-start">
                <div className="flex min-w-0 flex-col gap-4">
                    <Section step={1} title="Shipping address">
                        <AddressSelector
                            labelledBy="step-1"
                            addresses={addresses}
                            loading={addressesQuery.isLoading}
                            error={!!addressesQuery.error}
                            selectedId={address?.id}
                            onSelect={(id) => { setAddressId(id); setMessage(null); }}
                            disabled={busy}
                        />
                    </Section>

                    <Section step={2} title="Payment">
                        <PaymentOptions
                            labelledBy="step-2"
                            methods={methods}
                            loading={!methodsSettled}
                            value={payWith}
                            onChange={choose}
                            amount={amount}
                            elementsRef={elementsRef}
                            onFieldsReady={() => setFieldsReady(true)}
                            saveCard={saveCard}
                            onSaveCardChange={setSaveCard}
                            disabled={busy}
                        />
                    </Section>
                </div>

                <section aria-label="Order summary" className={`flex flex-col gap-4 md:sticky md:top-20 ${PANEL}`}>
                    <h2 className="text-lg font-semibold">Order summary</h2>
                    <ul className="flex flex-col divide-y divide-white/10">
                        {items.map((item) => (
                            <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                <PosterThumb url={item.movie.poster} width={40} height={60} className="block h-[60px] w-10" />
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <span className="truncate text-sm font-medium">{item.movie.title}</span>
                                    <span className="text-xs text-white/60">
                                        {item.quantity > 1 ? `${item.quantity} × ${formatPrice(item.price)}` : formatPrice(item.price)}
                                    </span>
                                    {item.quantity > MAX_PER_TITLE && (
                                        <span className="text-xs text-amber-300">Limit {MAX_PER_TITLE} per title</span>
                                    )}
                                </div>
                                <span className="shrink-0 text-sm">{formatPrice(item.price * item.quantity)}</span>
                            </li>
                        ))}
                    </ul>

                    <dl className="flex flex-col gap-1.5 border-t border-white/10 pt-4">
                        <Row label={`Subtotal (${count} ${count === 1 ? "item" : "items"})`}>{formatPrice(subtotal)}</Row>
                        <Row label="Shipping">{formatPrice(shipping)}</Row>
                        <Row label="Tax">
                            {taxPending ? <span aria-label="Calculating" className={`h-4 w-12 align-middle ${BAR}`} />
                                : invoice ? formatPrice(invoice.tax)
                                : <span className="text-white/50">—</span>}
                        </Row>
                        <Row label="Total" strong>
                            {taxPending ? <span aria-label="Calculating" className={`h-5 w-16 align-middle ${BAR}`} />
                                : invoice ? formatPrice(invoice.total)
                                : <span className="text-white/50">—</span>}
                        </Row>
                    </dl>

                    {overLimit.length > 0 && (
                        <p className="text-sm text-amber-300">
                            Some titles are over the limit of {MAX_PER_TITLE}. <Link href="/cart" className="underline">Change them in your cart</Link> to check out.
                        </p>
                    )}
                    {invoiceQuery.error && !invoice && (
                        <div className="flex flex-col items-start gap-2 text-sm text-red-300" role="alert">
                            <p>Couldn’t work out tax for this address. Check it, or try another.</p>
                            <button type="button" onClick={() => invoiceQuery.mutate()} className={`${CHIP} px-3.5`}>Try again</button>
                        </div>
                    )}
                    {message && <p role="alert" className="text-sm text-red-300">{message}</p>}

                    <button
                        type="button"
                        onClick={pay}
                        disabled={!canPay}
                        className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-black transition-colors hover:bg-white/85 disabled:cursor-default disabled:opacity-60 disabled:hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                        {pending && <Spinner />}
                        {pending === "paying" ? "Paying…"
                            : pending === "placing" ? "Placing order…"
                            : invoice && !taxPending ? `Pay ${formatPrice(invoice.total)}`
                            : "Pay"}
                    </button>
                    <p className="flex items-start gap-1.5 text-xs text-white/50">
                        <LockOutlined sx={{ fontSize: 14 }} className="mt-px shrink-0" />
                        {payWith === NEW_CARD
                            ? "Card details go straight to Stripe; they never reach our servers."
                            : chosenCard ? `Charged to ${cardName(chosenCard)}. Payments are processed by Stripe.`
                            : "Payments are processed by Stripe."}
                    </p>
                </section>
            </div>
        );
    }

    return (
        // isolate keeps the backdrop's -z-10 inside this page.
        <main className="relative isolate mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-16 pt-8 text-white">
            <FavoriteBackdrop />
            <Link href="/cart" className={`${CHIP} w-fit pl-2 pr-3.5`}>
                <ChevronLeftRoundedIcon sx={CHIP_ICON_SIZE} /> Cart
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
            {body}
        </main>
    );
}
