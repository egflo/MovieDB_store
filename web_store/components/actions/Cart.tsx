import React, {useState} from 'react';
import Button from "@mui/material/Button";
import useToastContext from "../../hooks/useToastContext";
import {ToastType} from "../Toast";
import {axiosInstance, auth} from "../../utils/firebase";



type CartProps = {
    itemId: string;
}

export default function Cart({itemId}: CartProps) {
    const {show} = useToastContext();
    const [quantity, setQuantity] = useState(1);

    const addToCart = async () => {

        if (auth.currentUser != null) {
            const token = await auth.currentUser?.getIdToken(true);
            console.log(token);

            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            axiosInstance.post("inventory-service/cart/", {
                itemId: itemId,
                userId: auth.currentUser?.uid,
                quantity: quantity,
            }).then((response) => {
                console.log(response);
                show("Added to cart", ToastType.INFO);

            }).catch((error) => {
                console.log(error);
                show("Could not add to cart", ToastType.ERROR);
            });
        }
        else {
            show("You must be logged in to add to cart", ToastType.ERROR);
        }

    }

    return (
        <Button onClick={addToCart} variant="contained" color="primary">
            Add to cart
        </Button>
    );
}