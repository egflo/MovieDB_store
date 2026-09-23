'use client';

import React, { useState } from "react";
import { Add, Remove, DeleteOutline } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import { Cart } from "@/lib/models/Cart";
import { useAuth } from "@/lib/firebase/AuthContext";
import { setCartQuantity, deleteCartItem, MAX_PER_TITLE } from "@/lib/api/cart";
import { useCart } from "@/lib/context/CartContext";
import { useToast } from "@/app/components/Toast";

const ROUND = "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/40 ring-1 ring-inset ring-white/15 transition-colors " +
    "hover:bg-white/10 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-black/40";

/**
 * - n + for a cart line, plus a Remove button that's always there (it used to
 * appear only at quantity 1). - stops at 1; Remove takes the line out. Lines
 * over MAX_PER_TITLE (from before the limit) can go down but not up.
 */
export default function QuantityControl({ item }: { item: Cart }) {
    const { user } = useAuth();
    const { refresh } = useCart();
    const toast = useToast();
    const [pending, setPending] = useState(false);

    async function run(action: (token: string) => Promise<unknown>, failure: string) {
        if (!user || pending) return;
        setPending(true);
        try {
            await action(user.idToken);
            await refresh();
        } catch (e) {
            console.warn(failure, e);
            toast({ message: `${failure}. Try again.`, tone: "error" });
        } finally {
            setPending(false);
        }
    }

    // POST /cart/{id} sets the quantity (POST /cart/ would add to it).
    const setQuantity = (next: number) =>
        run((token) => setCartQuantity(token, item.id, next), "Couldn’t update the quantity");
    const remove = () =>
        run(async (token) => {
            await deleteCartItem(token, item.id);
            toast({ message: `Removed ${item.movie.title} from your cart` });
        }, "Couldn’t remove that item");

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
                <button type="button" className={ROUND} aria-label={`Fewer copies of ${item.movie.title}`}
                        disabled={pending || item.quantity <= 1} onClick={() => setQuantity(item.quantity - 1)}>
                    <Remove sx={{ fontSize: 18 }} />
                </button>
                <span className="min-w-7 text-center text-sm tabular-nums" aria-live="polite" aria-label={`Quantity ${item.quantity}`}>
                    {pending ? <CircularProgress size={14} color="inherit" /> : item.quantity}
                </span>
                <button type="button" className={ROUND} aria-label={`More copies of ${item.movie.title}`}
                        disabled={pending || item.quantity >= MAX_PER_TITLE} onClick={() => setQuantity(item.quantity + 1)}>
                    <Add sx={{ fontSize: 18 }} />
                </button>
            </div>
            <button type="button" onClick={remove} disabled={pending}
                    className="flex cursor-pointer items-center gap-1 text-sm text-white/60 transition-colors hover:text-white disabled:cursor-default disabled:opacity-40">
                <DeleteOutline sx={{ fontSize: 18 }} /> Remove
            </button>
        </div>
    );
}
