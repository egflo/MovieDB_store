import React, {useState} from 'react';
import useToastContext from "../../hooks/useToastContext";
import {ToastType} from "../Toast";
import {axiosInstance, auth} from "../../utils/firebase";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { ShoppingBagOutlined} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import {Movie} from "../../models/Movie";
import {useCart} from "../../contexts/CartContext";


interface ItemPropsItemProps {
    movie: Movie;
}

const CART_URL:string = `${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/cart/`;

// @ts-ignore
export default function Cart(props: ItemPropsItemProps) {
    const {movie} = props;
    const toast = useToastContext();
    const cart = useCart();
    const [selected, setSelected] = useState(false);
    const [quantity, setQuantity] = useState(1);

    function priceFormatter(price: number) {
        const convert = price / 100;
        return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(convert);
    }

    const handleSelected = async () => {

        if (auth.currentUser != null) {
            const token = await auth.currentUser?.getIdToken(true);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            axiosInstance.post(CART_URL, {
                itemId: movie.id,
                userId: auth.currentUser?.uid,
                quantity: quantity,
            }).then((response) => {
                cart.addItemToCart(response.data);
                toast.show("Added to cart", ToastType.INFO);
                setSelected(true);

            }).catch((error) => {
                toast.show("Could not add to cart", ToastType.ERROR);
            });
        }
        else {
            toast.show("You must be logged in to add to cart", ToastType.ERROR);
        }

    }

    return (
        <Box className="
                    button_test
                    rounded-full
                    w-24
                    hover:bg-gray-700 hover:border-gray-700 hover:shadow-lg
                    flex
                    pr-1
                    "
        >

            <IconButton
                className={"hover:bg-[rgba(37,197,94,0.5)] hover:border-gray-700 hover:shadow-lg hover:text-green-500"}

                onClick={handleSelected}>
                 <ShoppingBagOutlined className={"size-6 md:size-6"} />
            </IconButton>

            <Box className="flex flex-row items-center gap-1">
                <Box className="p-1">
                    <Typography className="text-white font-bold text-xs">{priceFormatter(movie.item?.price!)}</Typography>
                </Box>
            </Box>
        </Box>
    )
}
