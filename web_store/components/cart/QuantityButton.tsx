import React, {SetStateAction, useEffect, useState} from 'react';
import {
    Button,
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import useToastContext from "../../hooks/useToastContext";
import {axiosInstance} from "../../utils/firebase";
import {ToastType} from "../Toast";
import {Cart} from "../../models/Cart";
import {useCart} from "../../contexts/CartContext";

const CART_API:string = `${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/cart`;

interface CartItemProps {
    item: Cart;
    mutate: any;
}

const MAX_QUANTITY = 4;

export default function QuantityControl(props: CartItemProps) {
    const [quantity, setQuantity] = React.useState(props.item.quantity);
    const toast = useToastContext();
    const cart = useCart();

    function onUpdate(value: number) {

        if(value > MAX_QUANTITY) {
            toast.show("Max quantity is 4", ToastType.ERROR);
            return;
        }

        let data = {
            id: props.item.id,
            userId: props.item.userId,
            itemId: props.item.itemId,
            quantity: value
        }
        // update the cart
        axiosInstance.post(`${CART_API}/`, data).then((response) => {
            if (response.status === 200) {
                //toast.show("CartButton updated", ToastType.SUCCESS);
                setQuantity(value);
                props.mutate();
                cart.removeItemFromCart(props.item.id);
                cart.addItemToCart(response.data);

            } else {
                toast.show("Could not update cart", ToastType.ERROR);
            }
        });
    }

    function onDelete() {
        axiosInstance.delete(`${CART_API}/${props.item.id}`).then((response) => {
            if (response.status === 200) {
                props.mutate();
                cart.removeItemFromCart(props.item.id);

            } else {
                toast.show("Could not delete item", ToastType.ERROR);
            }
        });
    }

    useEffect(() => {

        props.mutate();

    }, [quantity]);


    const handleSelect = (value: SetStateAction<number>) => {
        const quantity = parseInt(value as unknown as string);
        onUpdate(quantity);
    };

    return (
        <div className={"flex items-center gap-2.5"}>
            {/* Minus button */}

            <Button
                className={"bg-blue-800"}
                color="primary"
                variant="contained"
                onClick={() => {
                    if(quantity === 1) {
                        onDelete();
                        return;
                    }

                    onUpdate(quantity - 1);
                }}
            >
                {quantity === 1 ? <DeleteIcon/> : <RemoveIcon />} {/* Conditional icon */}
            </Button>

            {/* Dropdown button */}
            <FormControl size="small" variant="outlined">
                <Select
                    native
                    value={quantity}
                    onChange={(event) => {
                       handleSelect(parseInt(event.target.value as string));
                    }}
                    inputProps={{
                        name: 'qty',
                        id: 'qty-native',
                    }}
                >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                </Select>
            </FormControl>

            {/* Right button (trash can or plus sign) */}
            <Button
                className={"bg-blue-800"}
                color="primary"
                variant="contained"
                onClick={() => {
                    onUpdate(quantity + 1); // Increase the quantity
                }}
            >
                <AddIcon />
            </Button>

            <Button
                className={"bg-blue-800 hidden md:block"}
                onClick={onDelete}
                variant="contained"
                color="error"
            >Remove</Button>
        </div>
    );
}
