"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { createMovie, createProduct, errorMessage } from "@/lib/api/admin/movies";
import { useAuth } from "@/lib/firebase/AuthContext";
import PageHeader from "@/app/ui/PageHeader";
import MovieForm from "../MovieForm";
import { emptyForm } from "../movieFormState";
import { parseDollars, parseQuantity, SaleFields } from "../Sale";

export default function NewProduct() {
    const router = useRouter();
    const { user } = useAuth();
    const initial = useMemo(() => emptyForm(), []);
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("10");
    const [tried, setTried] = useState(false);

    const cents = parseDollars(price);
    const count = parseQuantity(quantity);
    const saleError = cents === null || count === null ? "Price and stock" : null;

    return (
        <>
            <Button component={Link} href="/products" startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 2, ml: -1 }}>
                Products
            </Button>
            <PageHeader title="Add product" subtitle="A new movie, on sale in the store as soon as it’s saved." />

            <MovieForm
                mode="create"
                initial={initial}
                submitLabel="Add product"
                extraError={saleError}
                onSubmitAttempt={() => setTried(true)}
                extra={
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" component="h2" fontWeight={600} gutterBottom>
                                Price and stock
                            </Typography>
                            <SaleFields
                                price={price}
                                quantity={quantity}
                                onPrice={setPrice}
                                onQuantity={setQuantity}
                                showErrors={tried}
                            />
                        </CardContent>
                    </Card>
                }
                onSubmit={async (request) => {
                    if (!user) throw new Error("Signed out: sign in again.");
                    if (cents === null || count === null) throw new Error("Fix the highlighted fields first.");

                    let movie;
                    try {
                        movie = await createMovie(user.idToken, request);
                    } catch (e) {
                        console.warn("Movie create failed", e);
                        throw new Error(await errorMessage(e, "Couldn’t add the movie. Try again."));
                    }

                    // Two services, so two calls: if the second fails the movie
                    // exists without a price, and its page offers "Put on sale".
                    try {
                        await createProduct(user.idToken, { id: movie.id, sku: movie.movieId, price: cents, quantity: count });
                        router.push(`/products/${movie.id}?created=1`);
                    } catch (e) {
                        console.warn("Product create failed after the movie was added", e);
                        router.push(`/products/${movie.id}?created=1&sale=failed`);
                    }
                }}
            />
        </>
    );
}
