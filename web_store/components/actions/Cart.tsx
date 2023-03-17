import React, {useState} from 'react';
import Button from "@mui/material/Button";
import useToastContext from "../../hooks/useToastContext";
import {ToastType} from "../Toast";
import {axiosInstance, auth} from "../../utils/firebase";
import {Item} from "../../models/Item";


type CartProps = {
    item: Item;
}

const API_CART:string = `${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/cart/`;

export default function Cart({item}: CartProps) {
    const {show} = useToastContext();
    const [quantity, setQuantity] = useState(1);

    const addToCart = async () => {

        if (auth.currentUser != null) {
            const token = await auth.currentUser?.getIdToken(true);
            console.log(token);

            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            axiosInstance.post(API_CART, {
                itemId: item.id,
                userId: auth.currentUser?.uid,
                quantity: quantity,
            }).then((response) => {
                show("Added to cart", ToastType.INFO);

            }).catch((error) => {
                show("Could not add to cart", ToastType.ERROR);
            });
        }
        else {
            show("You must be logged in to add to cart", ToastType.ERROR);
        }

    }

    return (
        <Button onClick={addToCart} variant="contained" color="primary" size={"large"}>
            Add to cart for ${item.price} ({item.quantity})
        </Button>
    );
}