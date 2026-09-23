// Shared by the orders list and the order detail page. A plain module, so a
// server component (the detail page's metadata) could use it too.
import { Order } from "@/lib/models/Order";

/**
 * Shipping isn't stored on an order. order_service adds a flat $5.00 when it
 * asks Stripe to calculate tax, and total includes it, so it's whatever the
 * total holds beyond subtotal and tax. Without this line the receipt didn't
 * add up. Never negative, in case of rounding.
 */
export function orderShippingCost(order: Pick<Order, "total" | "subTotal" | "tax">): number {
    return Math.max(0, order.total - order.subTotal - order.tax);
}

/** "Gladiator", "Gladiator and The Dark Knight", "Gladiator, The Dark Knight + 2 more". */
export function orderTitles(order: Pick<Order, "items">): string {
    const titles = (order.items ?? []).map((i) => i.description).filter(Boolean);
    if (titles.length <= 1) return titles[0] ?? "";
    if (titles.length === 2) return `${titles[0]} and ${titles[1]}`;
    return `${titles[0]}, ${titles[1]} + ${titles.length - 2} more`;
}

/** "May 15, 2024". */
export const orderDate = (ms: number) =>
    new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

/** "May 15, 2024, 4:58 PM" (en-US). */
export const orderDateTime = (ms: number) =>
    new Date(ms).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/** "Paid with Discover", or null when the order doesn't say. */
export function paymentLabel(order: Pick<Order, "network" | "paymentType">): string | null {
    if (order.network) return `Paid with ${order.network.charAt(0).toUpperCase()}${order.network.slice(1)}`;
    if (order.paymentType) return `Paid by ${order.paymentType}`;
    return null;
}

/**
 * Display names for order_service's Status enum. Nothing advances an order past
 * CREATED yet (no Stripe webhook), and checkout charges the card before the
 * order is created, so CREATED reads as "Placed".
 */
const STATUS_LABELS: Record<string, string> = {
    CREATED: "Placed",
    PAID: "Paid",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
};

export const orderStatusLabel = (status: string) =>
    STATUS_LABELS[status] ?? status.charAt(0) + status.slice(1).toLowerCase();
