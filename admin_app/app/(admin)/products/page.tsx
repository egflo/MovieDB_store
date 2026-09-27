import type { Metadata } from "next";
import { Suspense } from "react";
import ProductList from "./ProductList";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
    // ProductList reads the URL's search params, which needs a Suspense boundary.
    return (
        <Suspense fallback={null}>
            <ProductList />
        </Suspense>
    );
}
