'use client';

import React from "react";

// Mirrors order_service's Status enum: CREATED, PAID, SHIPPED, DELIVERED,
// CANCELLED. Note nothing in the backend currently advances an order past
// CREATED — there is no Stripe webhook handler — so that is the status you
// should expect to see in practice.
const STYLES: Record<string, string> = {
    CREATED: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    PAID: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    SHIPPED: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
    DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
};

export default function StatusPill({ status }: { status?: string }) {
    if (!status) return null;
    const style = STYLES[status] ?? STYLES.CREATED;

    return (
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${style}`}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
    );
}
