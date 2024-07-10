import React, {useState} from 'react';
import Button from "@mui/material/Button";
import useToastContext from "../../hooks/useToastContext";
import {ToastType} from "../Toast";
import {axiosInstance, auth} from "../../utils/firebase";
import {Item} from "../../models/Item";
import {useSWRConfig} from "swr";


type CartProps = {
    item: Item;
    children?: React.ReactNode;
}

const API_CART:string = `${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/cart/`;

export default function CartButton({item,children}: CartProps) {
    const {show} = useToastContext();
    const [quantity, setQuantity] = useState(1);
    const { mutate } = useSWRConfig()

    const addToCart = async () => {

        if (auth.currentUser != null) {
            const token = await auth.currentUser?.getIdToken(true);

            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            console.log({
                itemId: item.id,
                userId: auth.currentUser?.uid,
                quantity: quantity,
            })

            axiosInstance.post(API_CART, {
                itemId: item.id,
                userId: auth.currentUser?.uid,
                quantity: quantity,
            }).then((response) => {
                show("Added to cart", ToastType.INFO);
                mutate(API_CART);

            }).catch((error) => {
                show("Could not add to cart", ToastType.ERROR);
            });
        }
        else {
            show("You must be logged in to add to cart", ToastType.ERROR);
        }

    }

    function formatPrice(price: number) {
        const convert = price / 100;
        return convert.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    }

    return (

        <Button onClick={addToCart} variant="contained" color="primary" size={"large"} className={" bg-blue-700"}>
            Add to bag for ${formatPrice(item.price)} ({item.quantity})
        </Button>
    );
}