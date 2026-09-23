'use client';

import React from "react";
import { orderStatusLabel } from "./format";

// Tints for the dark glass pages, keyed by order_service's Status enum.
const STYLES: Record<string, string> = {
    CREATED: "bg-white/10 text-white/85 ring-white/15",
    PAID: "bg-sky-400/15 text-sky-200 ring-sky-300/25",
    SHIPPED: "bg-amber-400/15 text-amber-200 ring-amber-300/25",
    DELIVERED: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/25",
    CANCELLED: "bg-red-400/15 text-red-200 ring-red-300/25",
};

export default function StatusPill({ status }: { status?: string }) {
    if (!status) return null;
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STYLES[status] ?? STYLES.CREATED}`}>
            {orderStatusLabel(status)}
        </span>
    );
}
