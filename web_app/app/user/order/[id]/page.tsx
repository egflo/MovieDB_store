import type { Metadata } from "next";
import OrderDetail from "./OrderDetail";

/** "Order #44 · MovieDB". */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    return { title: /^\d+$/.test(id) ? `Order #${id}` : "Order" };
}

export default async function Page({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ placed?: string }>;
}) {
    const { id } = await params;
    // Checkout lands here with ?placed=1 to show the confirmation.
    const { placed } = await searchParams;
    return <OrderDetail id={id} justPlaced={placed === "1"} />;
}
