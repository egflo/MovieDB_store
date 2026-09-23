'use client'

import React, {useState} from 'react';
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { ShoppingBagOutlined} from "@mui/icons-material";
import {Movie} from "@/lib/models/Movie";
import {useAuth} from "@/lib/firebase/AuthContext";
import {useCart} from "@/lib/context/CartContext";
import {saveCartItem} from "@/lib/api/cart";
import useSWR from "swr";
import {CHIP, CHIP_ICON_SIZE} from "@/app/ui/chip";


interface ItemPropsItemProps {
    id: string;
}

const PRODUCT_URL:string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/product/`;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Cart({id}: ItemPropsItemProps) {
    const auth = useAuth();
    const {refresh: refreshCart} = useCart();
    const [selected, setSelected] = useState(false);
    const [item, setItem] = useState<any | null>(null);
    const [hovered, setHovered] = useState(false);

    const {data, isLoading, error} = useSWR(`${PRODUCT_URL}${id}`, fetcher, {
        errorRetryCount: 3,
        errorRetryInterval: 1000,
        onSuccess: (data) => {
            setItem(data);
        },
    });

    if (error) return <div>Failed to load {error.message}</div>
    if (isLoading) return <div>Loading...</div>

    function priceFormatter(item: any) {
        const convert = item.price / 100;
        return new Intl.NumberFormat('en-US', {style: 'currency', currency: item.currency}).format(convert);
    }

    const handleSelected = async () => {
        if (!auth.user) {
            console.error('User is not authenticated');
            return;
        }

        try {
            // Goes through lib/api/cart so the ID token is refreshed per
            // request rather than using the server-render snapshot.
            await saveCartItem(auth.user.idToken, {
                itemId: data.id,
                userId: auth.user.uid,
                // Add one. This previously sent the product's *stock* quantity,
                // which put the entire inventory of the title in the cart.
                quantity: 1,
            });
            await refreshCart();
            setSelected(true);
        } catch (e) {
            console.error('Failed to add item to cart', e);
        }
    }

    return (
        <button
            onMouseEnter={() => setHovered(true)}
            disabled={!data }
            onClick={handleSelected}

            // Styled like the genre chips above it.
            className={`${CHIP} cursor-pointer px-3.5`}>
            <ShoppingBagOutlined sx={CHIP_ICON_SIZE} />
            <span>{priceFormatter(data)}</span>
        </button>
    )
}
