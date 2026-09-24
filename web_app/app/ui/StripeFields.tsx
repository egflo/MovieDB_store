'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PaymentElement } from "@stripe/react-stripe-js";

/**
 * The Payment Element (tabs layout, cards only, US) lays its fields out by
 * its own width, not the viewport's (measured):
 * - narrow, under 442px: card / expiry, CVC / country / ZIP;
 * - mid, 442–591px: card / expiry, CVC / country, ZIP;
 * - wide, 592px up: card, expiry, CVC / country, ZIP.
 */
type Layout = 0 | 1 | 2;
const layoutFor = (width: number): Layout => (width >= 592 ? 2 : width >= 442 ? 1 : 0);

/** Column spans (of 4) for card, expiry, CVC, country, ZIP, per layout. */
const SPANS: Record<Layout, number[]> = {
    0: [4, 2, 2, 4, 4],
    1: [4, 2, 2, 2, 2],
    2: [2, 1, 1, 2, 2],
};
const SPAN_CLASS = ["", "col-span-1", "col-span-2", "col-span-3", "col-span-4"];

/**
 * Stand-in for Stripe's fields while its iframe loads, laid over it: the
 * panel used to sit empty with the button live, then jump as the fields
 * arrived. Same rows as the real form, plus the terms Stripe adds under a
 * card that's being saved.
 */
function FieldsSkeleton({ layout, terms }: { layout: Layout; terms: boolean }) {
    const bar = "animate-pulse rounded-xl bg-white/10";
    return (
        <div aria-hidden className="grid grid-cols-4 gap-3">
            {SPANS[layout].map((span, n) => (
                <div key={n} className={`flex flex-col gap-1.5 ${SPAN_CLASS[span]}`}>
                    <span className={`h-3.5 w-20 ${bar}`} />
                    <span className={`h-11 ${bar}`} />
                </div>
            ))}
            {terms && <>
                <span className={`col-span-4 mt-1 h-3 ${bar}`} />
                <span className={`col-span-3 h-3 ${bar}`} />
            </>}
        </div>
    );
}

/**
 * Stripe's Payment Element that doesn't jump while it loads. `heights` is
 * the element's measured height in px for each layout (narrow, mid, wide):
 * while loading the box is exactly that tall and clips (Stripe's own 210px
 * loader would otherwise push the panel taller, then shrink it); once ready
 * it's a minimum, so nothing moves. Must sit inside <Elements>.
 */
export default function StripeFields({ heights, terms = false, onReady }: {
    heights: [number, number, number];
    terms?: boolean;
    onReady?: () => void;
}) {
    const fieldsRef = useRef<HTMLDivElement>(null);
    // Measured before the first paint, so the reserved height is right from the start.
    const [layout, setLayout] = useState<Layout>(0);
    useLayoutEffect(() => {
        const box = fieldsRef.current;
        if (!box) return;
        const measure = () => setLayout(layoutFor(box.getBoundingClientRect().width));
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(box);
        return () => observer.disconnect();
    }, []);

    // Stripe's iframe takes a moment (longer on first load): until it
    // reports ready, show placeholders.
    const [ready, setReady] = useState(false);
    // Stripe removes its own loader a moment after "ready"; keep the box
    // clipped until then, or the panel blips taller for a frame.
    const [settled, setSettled] = useState(false);
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

    const height = heights[layout];
    return (
        // The element stays in the layout while it loads (a display:none
        // iframe measures 0 and resizes only once shown), transparent under
        // the placeholder, and fades in when Stripe says it's ready.
        <div
            ref={fieldsRef}
            style={settled ? { minHeight: height } : { height }}
            className={`relative ${settled ? "" : "overflow-hidden"}`}
        >
            <div className={`transition-opacity duration-200 ${ready ? "opacity-100" : "opacity-0"}`}>
                <PaymentElement options={{ layout: "tabs" }} onReady={() => { setReady(true); onReady?.(); }} />
            </div>
            {!ready && <div className="absolute inset-0"><FieldsSkeleton layout={layout} terms={terms} /></div>}
        </div>
    );
}
