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
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <OrderDetail id={id} />;
}
