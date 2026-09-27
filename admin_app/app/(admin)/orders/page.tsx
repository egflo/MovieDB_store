import type { Metadata } from "next";
import NotBuiltYet from "@/app/ui/NotBuiltYet";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
    return (
        <NotBuiltYet
            title="Orders"
            summary="Every customer's orders, paged and searchable, with each order's lines and shipping address."
            needs={[
                { what: "List every order", endpoint: "GET /order-service/admin/orders", ready: true },
                { what: "Search shipping addresses", endpoint: "GET /order-service/admin/address/all | firstname | lastname | postcode", ready: true },
                { what: "Open one order as an admin", endpoint: "missing (the user route is owner-checked)", ready: false },
                { what: "Change status, cancel or refund", endpoint: "missing (waits on the Stripe webhook, items 14 and 16)", ready: false },
            ]}
        />
    );
}
