import type { Metadata } from "next";
import { Suspense } from "react";
import ProductDetail from "./ProductDetail";

export const metadata: Metadata = { title: "Edit product" };

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // ProductDetail reads ?created / ?sale, which needs a Suspense boundary.
    return (
        <Suspense fallback={null}>
            <ProductDetail id={id} />
        </Suspense>
    );
}
