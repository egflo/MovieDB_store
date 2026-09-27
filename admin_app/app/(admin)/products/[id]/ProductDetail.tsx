"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { errorMessage, updateMovie } from "@/lib/api/admin/movies";
import { useInventory, useMovie } from "@/lib/api/admin/products";
import { useAuth } from "@/lib/firebase/AuthContext";
import StockChip from "@/app/ui/StockChip";
import MovieForm from "../MovieForm";
import { formFromMovie } from "../movieFormState";
import { PriceStockForm, PutOnSaleForm } from "../Sale";

/** The store, for "View in store". web_app runs on 3000 locally. */
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3000";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

function InventoryCard({ movieId, sku, onMessage }: { movieId: string; sku: string; onMessage: (m: string) => void }) {
    const { data, error, isLoading, mutate } = useInventory(movieId);

    return (
        <Card sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
            <CardContent>
                <Typography variant="subtitle1" component="h2" fontWeight={600} gutterBottom>
                    Price and stock
                </Typography>

                {isLoading && <Skeleton height={120} />}
                {error && <Alert severity="error">Couldn’t load price and stock from inventory_service.</Alert>}
                {data === null && (
                    <PutOnSaleForm
                        movieId={movieId}
                        sku={sku}
                        onCreated={(product) => {
                            mutate(product, { revalidate: false });
                            onMessage("On sale now");
                        }}
                    />
                )}

                {data && (
                    <Stack spacing={2} divider={<Divider flexItem />}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <StockChip status={data.status} />
                            <Typography variant="body2">{data.quantity} in stock</Typography>
                        </Box>
                        <Box>
                            <PriceStockForm
                                product={data}
                                onSaved={(product) => {
                                    mutate(product, { revalidate: false });
                                    onMessage("Price and stock saved");
                                }}
                            />
                            <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
                                The store shows changes at once; search and price sorting pick up a new price within an hour.
                            </Typography>
                        </Box>
                        <Box component="dl" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, m: 0 }}>
                            {[
                                ["SKU", data.sku],
                                ["Currency", data.currency?.toUpperCase()],
                                ["Added", dateFormat.format(new Date(data.created))],
                                ["Updated", dateFormat.format(new Date(data.updated))],
                            ].map(([label, value]) => (
                                <Box key={label}>
                                    <Typography variant="caption" color="text.secondary" component="dt">{label}</Typography>
                                    <Typography variant="body2" component="dd" sx={{ m: 0 }}>{value || "—"}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}

export default function ProductDetail({ id }: { id: string }) {
    const { user } = useAuth();
    const params = useSearchParams();
    const { data: movie, error, isLoading, mutate } = useMovie(id);
    const [message, setMessage] = useState(params.get("created") ? "Movie added" : "");

    // A new starting point for the form only when the movie itself changes (load or save).
    const initial = useMemo(() => (movie ? formFromMovie(movie) : null), [movie]);

    return (
        <>
            <Button component={Link} href="/products" startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 2, ml: -1 }}>
                Products
            </Button>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h5" component="h1" fontWeight={600}>
                        {isLoading ? <Skeleton width={280} /> : movie?.title || (movie ? "Untitled" : "Product")}
                    </Typography>
                    {movie && (
                        <Typography variant="body2" color="text.secondary">{movie.movieId} · {movie.id}</Typography>
                    )}
                </Box>
                {movie && (
                    <Button href={`${STORE_URL}/movie/${movie.id}`} target="_blank" rel="noopener" endIcon={<OpenInNewRoundedIcon />}>
                        View in store
                    </Button>
                )}
            </Box>

            {params.get("sale") === "failed" && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    The movie was added, but putting it on sale failed. Set its price and stock under “Price and stock”.
                </Alert>
            )}
            {/* movie_service answers 500 for an unknown id (WORKPLAN 24), so an error is usually "not found". */}
            {error && <Alert severity="warning" sx={{ mb: 3 }}>No movie with id <code>{id}</code>, or movie_service couldn’t be reached.</Alert>}

            <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" }, alignItems: "start" }}>
                <Box sx={{ minWidth: 0, order: { xs: 2, lg: 1 } }}>
                    {isLoading && <Skeleton variant="rounded" height={420} />}
                    {movie && initial && (
                        <MovieForm
                            mode="edit"
                            initial={initial}
                            base={movie}
                            submitLabel="Save changes"
                            onSubmit={async (request) => {
                                if (!user) throw new Error("Signed out: sign in again.");
                                try {
                                    const saved = await updateMovie(user.idToken, movie.id, request);
                                    await mutate(saved, { revalidate: false });
                                    setMessage("Movie saved");
                                } catch (e) {
                                    console.warn("Movie update failed", e);
                                    throw new Error(await errorMessage(e, "Couldn’t save the movie. Try again."));
                                }
                            }}
                        />
                    )}
                </Box>
                <Box sx={{ order: { xs: 1, lg: 2 } }}>
                    {movie && <InventoryCard movieId={movie.id} sku={movie.movieId} onMessage={setMessage} />}
                </Box>
            </Box>

            <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage("")} message={message} />
        </>
    );
}
