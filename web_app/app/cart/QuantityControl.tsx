'use client';

import React, { useState } from "react";
import { Add, Remove, DeleteOutline } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import { Cart } from "@/lib/models/Cart";
import { useAuth } from "@/lib/firebase/AuthContext";
import { saveCartItem, deleteCartItem } from "@/lib/api/cart";
import { useCart } from "@/lib/context/CartContext";

const MAX_QUANTITY = 4;

export default function QuantityControl({ item }: { item: Cart }) {
    const { user } = useAuth();
    const { refresh } = useCart();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function update(next: number) {
        if (!user || pending) return;

        if (next > MAX_QUANTITY) {
            setError(`Limit ${MAX_QUANTITY} per item`);
            return;
        }

        setPending(true);
        setError(null);
        try {
            if (next < 1) {
                await deleteCartItem(user.idToken, item.id);
            } else {
                await saveCartItem(user.idToken, {
                    id: item.id,
                    userId: item.userId,
                    itemId: item.itemId,
                    quantity: next,
                });
            }
            await refresh();
        } catch {
            setError("Could not update cart");
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center gap-1">
                <IconButton
                    size="small"
                    aria-label={item.quantity > 1 ? "Decrease quantity" : "Remove item"}
                    disabled={pending}
                    onClick={() => update(item.quantity - 1)}
                >
                    {item.quantity > 1 ? (
                        <Remove fontSize="small" />
                    ) : (
                        <DeleteOutline fontSize="small" />
                    )}
                </IconButton>

                <span className="min-w-6 text-center text-sm tabular-nums">
                    {item.quantity}
                </span>

                <IconButton
                    size="small"
                    aria-label="Increase quantity"
                    disabled={pending || item.quantity >= MAX_QUANTITY}
                    onClick={() => update(item.quantity + 1)}
                >
                    <Add fontSize="small" />
                </IconButton>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
