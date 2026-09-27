"use client";

import { FormEvent, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { createProduct, errorMessage, updateProduct } from "@/lib/api/admin/movies";
import { useAuth } from "@/lib/firebase/AuthContext";
import { InventoryProduct } from "@/lib/models/InventoryProduct";

/** "12.5" or "12.50" -> 1250 cents; null if it isn't a sensible price. */
export function parseDollars(value: string): number | null {
    if (!/^\d{1,4}(\.\d{0,2})?$/.test(value.trim())) return null;
    const cents = Math.round(parseFloat(value) * 100);
    return cents > 0 ? cents : null;
}

/** Whole, non-negative, and not absurd. */
export function parseQuantity(value: string): number | null {
    if (!/^\d{1,6}$/.test(value.trim())) return null;
    return Number(value.trim());
}

/** Under 10 is "Limited" and 0 is "Out of stock": inventory_service derives it. */
function statusHint(quantity: number | null): string {
    if (quantity === null) return " ";
    if (quantity === 0) return "Shows as Out of stock";
    if (quantity < 10) return "Shows as Limited";
    return "Shows as In stock";
}

/** Controlled price and quantity boxes, shared by every sale form. */
export function SaleFields({ price, quantity, onPrice, onQuantity, showErrors }: {
    price: string;
    quantity: string;
    onPrice: (value: string) => void;
    onQuantity: (value: string) => void;
    showErrors: boolean;
}) {
    const priceBad = parseDollars(price) === null;
    const quantityBad = parseQuantity(quantity) === null;
    return (
        <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
            <TextField
                label="Price"
                size="small"
                value={price}
                onChange={(e) => onPrice(e.target.value)}
                error={showErrors && priceBad}
                helperText={showErrors && priceBad ? "Like 14.99" : " "}
                slotProps={{
                    input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
                    htmlInput: { inputMode: "decimal" },
                }}
                sx={{ width: 150 }}
            />
            <TextField
                label="In stock"
                size="small"
                value={quantity}
                onChange={(e) => onQuantity(e.target.value)}
                error={showErrors && quantityBad}
                helperText={showErrors && quantityBad ? "A whole number" : statusHint(parseQuantity(quantity))}
                slotProps={{ htmlInput: { inputMode: "numeric" } }}
                sx={{ width: 170 }}
            />
        </Stack>
    );
}

/** Edit an existing product's price and stock. Sends only what changed. */
export function PriceStockForm({ product, onSaved }: { product: InventoryProduct; onSaved: (p: InventoryProduct) => void }) {
    const { user } = useAuth();
    const currentPrice = (product.price / 100).toFixed(2);
    // Stock that went negative (cart adds don't check) can't be saved back; start at 0.
    const currentQuantity = String(Math.max(0, product.quantity));
    const [price, setPrice] = useState(currentPrice);
    const [quantity, setQuantity] = useState(currentQuantity);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => { setPrice(currentPrice); setQuantity(currentQuantity); }, [currentPrice, currentQuantity]);

    const cents = parseDollars(price);
    const count = parseQuantity(quantity);
    const valid = cents !== null && count !== null;
    const changes: { price?: number; quantity?: number } = {};
    if (cents !== null && cents !== product.price) changes.price = cents;
    if (count !== null && count !== product.quantity) changes.quantity = count;
    const changed = Object.keys(changes).length > 0;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!user || !valid || !changed) return;
        setSaving(true);
        setError("");
        try {
            onSaved(await updateProduct(user.idToken, product.id, changes));
        } catch (e) {
            console.warn("Product update failed", e);
            setError(await errorMessage(e, "Couldn’t save price and stock. Try again."));
        } finally {
            setSaving(false);
        }
    }

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <SaleFields price={price} quantity={quantity} onPrice={setPrice} onQuantity={setQuantity} showErrors />
            {product.quantity < 0 && (
                <Typography variant="caption" color="warning.main" component="p" sx={{ mb: 1 }}>
                    Stored stock is {product.quantity} (carts took more than there was). Saving sets it to the number above.
                </Typography>
            )}
            <Stack direction="row" spacing={1}>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={!valid || !changed || saving}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    {saving ? "Saving" : "Save price and stock"}
                </Button>
                {changed && !saving && (
                    <Button onClick={() => { setPrice(currentPrice); setQuantity(currentQuantity); }}>Reset</Button>
                )}
            </Stack>
            {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        </Box>
    );
}

/** A movie with no inventory record: give it a price and stock. */
export function PutOnSaleForm({ movieId, sku, onCreated }: {
    movieId: string;
    sku: string;
    onCreated: (p: InventoryProduct) => void;
}) {
    const { user } = useAuth();
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("10");
    const [tried, setTried] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setTried(true);
        const cents = parseDollars(price);
        const count = parseQuantity(quantity);
        if (!user || cents === null || count === null) return;
        setSaving(true);
        setError("");
        try {
            onCreated(await createProduct(user.idToken, { id: movieId, sku, price: cents, quantity: count }));
        } catch (e) {
            console.warn("Product create failed", e);
            setError(await errorMessage(e, "Couldn’t put it on sale. Try again."));
        } finally {
            setSaving(false);
        }
    }

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Not for sale yet: give it a price and stock to add it to the store.
            </Typography>
            <SaleFields price={price} quantity={quantity} onPrice={setPrice} onQuantity={setQuantity} showErrors={tried} />
            <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            >
                {saving ? "Saving" : "Put on sale"}
            </Button>
            {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        </Box>
    );
}
