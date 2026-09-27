import useSWR from "swr";
import { authedFetcher, url } from "@/lib/api/client";
import { useAuth } from "@/lib/firebase/AuthContext";
import { Order } from "@/lib/models/Order";
import { Page } from "@/lib/models/Page";

export interface OrderQuery {
    limit?: number;
    /** 0-based. */
    page?: number;
    sortBy?: string;
    /** 0 = descending (the default), 1 = ascending. */
    direction?: 0 | 1;
}

/** Every user's orders, paged: GET /order-service/admin/orders (ADMIN only). */
export function adminOrdersUrl({ limit = 10, page = 0, sortBy = "id", direction = 0 }: OrderQuery = {}): string {
    const params = new URLSearchParams({
        limit: String(limit),
        page: String(page),
        sortBy,
        direction: String(direction),
    });
    return url("order", `admin/orders?${params}`);
}

export function useAdminOrders(query: OrderQuery = {}) {
    const { user } = useAuth();
    const token = user?.idToken;
    return useSWR<Page<Order>>(token ? [adminOrdersUrl(query), token] : null, authedFetcher);
}

/** The flat shipping every order pays; not stored on the order (WORKPLAN 16a). */
export function orderShippingCost(order: Order): number {
    return order.total - order.subTotal - order.tax;
}
