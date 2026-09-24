'use client'

import React, {useEffect, useState} from 'react';
import {useRouter} from "next/navigation";
import { ShoppingBagOutlined} from "@mui/icons-material";
import Spinner from "@/app/ui/Spinner";
import {useAuth} from "@/lib/firebase/AuthContext";
import {useCart} from "@/lib/context/CartContext";
import {addToCart, MAX_PER_TITLE} from "@/lib/api/cart";
import useSWR from "swr";
import {CHIP, CHIP_ICON_SIZE} from "@/app/ui/chip";
import {useToast} from "@/app/components/Toast";
import SignInDialog from "@/app/components/SignInDialog";


interface ItemPropsItemProps {
    id: string;
    /** For the toast ("Added Minions to your cart"). */
    title?: string;
}

const PRODUCT_URL:string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/product/`;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function priceFormatter(item: any) {
    const convert = item.price / 100;
    return new Intl.NumberFormat('en-US', {style: 'currency', currency: item.currency}).format(convert);
}

/**
 * The movie page's add-to-cart chip, labelled with the price. Adds one copy,
 * up to MAX_PER_TITLE per title, and confirms with a toast. Signed out, it opens
 * the sign-in dialog and adds once signed in.
 */
export default function Cart({id, title}: ItemPropsItemProps) {
    const auth = useAuth();
    const router = useRouter();
    const toast = useToast();
    const {items, refresh: refreshCart, loading: cartLoading} = useCart();
    const [pending, setPending] = useState(false);
    const [signInOpen, setSignInOpen] = useState(false);
    const [addAfterSignIn, setAddAfterSignIn] = useState(false);

    const {data, isLoading, error} = useSWR(`${PRODUCT_URL}${id}`, fetcher, {
        errorRetryCount: 3,
        errorRetryInterval: 1000,
    });

    const named = title ? ` ${title}` : "";
    const inCart = items.find((line) => line.itemId === data?.id)?.quantity ?? 0;

    async function add() {
        if (!auth.user || !data || pending) return;
        if (inCart >= MAX_PER_TITLE) {
            toast({ message: `You already have ${inCart} of${named || " this"} in your cart (limit ${MAX_PER_TITLE} per title).` });
            return;
        }
        setPending(true);
        try {
            // Goes through lib/api/cart so the ID token is refreshed per request.
            await addToCart(auth.user.idToken, { itemId: data.id, userId: auth.user.uid, quantity: 1 });
            await refreshCart();
            toast({
                message: `Added${named} to your cart`,
                action: { label: "View cart", onClick: () => router.push("/cart") },
            });
        } catch (e) {
            console.warn("Failed to add item to cart", e);
            toast({ message: "Couldn’t add that to your cart. Try again.", tone: "error" });
        } finally {
            setPending(false);
        }
    }

    // After sign-in, wait for the signed-in user and their cart, then add.
    useEffect(() => {
        if (!addAfterSignIn || !auth.user || cartLoading || !data) return;
        setAddAfterSignIn(false);
        add();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addAfterSignIn, auth.user, cartLoading, data]);

    if (error) return <div>Failed to load {error.message}</div>
    if (isLoading) return <div>Loading...</div>

    return (
        <>
            <button
                type="button"
                disabled={!data || pending}
                onClick={() => (auth.user ? add() : setSignInOpen(true))}
                aria-label={data ? `Add to cart, ${priceFormatter(data)}` : "Add to cart"}
                // Styled like the genre chips above it.
                className={`${CHIP} cursor-pointer px-3.5`}>
                {pending
                    ? <Spinner size={16} />
                    : <ShoppingBagOutlined sx={CHIP_ICON_SIZE} />}
                <span>{data && priceFormatter(data)}</span>
            </button>
            <SignInDialog
                open={signInOpen}
                onClose={() => setSignInOpen(false)}
                onSignedIn={() => setAddAfterSignIn(true)}
                reason="Sign in to add this movie to your cart."
            />
        </>
    )
}
