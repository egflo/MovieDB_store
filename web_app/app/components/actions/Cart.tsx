'use client'

import React, {useState} from 'react';
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { ShoppingBagOutlined} from "@mui/icons-material";
import {Movie} from "../../models/Movie";
import {useAuth} from "@/lib/firebase/AuthContext";
import useSWR from "swr";


interface ItemPropsItemProps {
    id: string;
    ItemComponent: React.ComponentType<{ item: Movie }>;
}

const CART_URL:string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/cart/`;
const PRODUCT_URL:string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/product/`;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Cart({id, ItemComponent}: ItemPropsItemProps) {
    const auth = useAuth();
    const [selected, setSelected] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [item, setItem] = useState<any | null>(null);
    const [hovered, setHovered] = useState(false);

    const {data, isLoading, error} = useSWR(`${PRODUCT_URL}${id}`, fetcher, {
        errorRetryCount: 3,
        errorRetryInterval: 1000,
        onSuccess: (data) => {
            setQuantity(data.quantity);
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
        // Check if the user is authenticated
        if (!auth.user) {
            console.error('User is not authenticated');
            return;
        }

        const body = {
            itemId: data.id,
            userId: auth.user.uid,
            quantity: quantity
        }
        console.log("Body", body);
        const response = await fetch(CART_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.user?.idToken}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error('Failed to add item to cart');
        }
        const cartData = await response.json();
        console.log("Cart Data", cartData);
    }

    return (
        <button
            onMouseEnter={() => setHovered(true)}
            disabled={!data }
            onClick={handleSelected}

            className="flex flex-row items-center justify-center gap-1 rounded-full p-2 bg-gray-900  hover:border-gray-800 hover:shadow-lg cursor-pointer ">
            <ShoppingBagOutlined
                className={"size-6 md:size-6 "} />

            <div className='flex flex-col items-center justify-center'>
                <p className="text-white font-bold text-xs">
                    {priceFormatter(data)}</p>
            </div>
        </button>
    )
}
