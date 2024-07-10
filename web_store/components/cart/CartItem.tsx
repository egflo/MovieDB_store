

import React, {useEffect} from 'react';
import {Box, Button, CircularProgress, Grid, InputLabel, Typography} from "@mui/material";
import {Cart} from "../../models/Cart";
import Card from "@mui/material/Card";
import {axiosInstance} from "../../utils/firebase";
import useToastContext from "../../hooks/useToastContext";
import {ToastType} from "../Toast";
import QuantityControl from "./QuantityButton";

interface CartItemProps {
    item: Cart;
    mutate: any;
}

function formatPrice(price: number) {
    const convert = price / 100;
    return convert.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
}


const CART_API:string = `${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/cart/`;

export const CartItem = (props: CartItemProps) => {
    const [quantity, setQuantity] = React.useState(props.item.quantity);
    const toast = useToastContext();


    function onUpdate(value: number) {
        let data = {
            id: props.item.id,
            userId: props.item.userId,
            itemId: props.item.itemId,
            quantity: value
        }
        // update the cart
        axiosInstance.post(`${CART_API}/`, data).then((response) => {
            if (response.status === 200) {
                toast.show("CartButton updated", ToastType.SUCCESS);
                setQuantity(value);
                props.mutate();

            } else {
                toast.show("Could not update cart", ToastType.ERROR);
            }
        });
    }

    function onDelete() {
        axiosInstance.delete(`${CART_API}/${props.item.id}`).then((response) => {
            if (response.status === 200) {
                toast.show("CartButton updated", ToastType.SUCCESS);
                props.mutate();

            } else {
                toast.show("Could not delete item", ToastType.ERROR);
            }
        });
    }

    useEffect(() => {
        props.mutate();
    }, [quantity]);

    return (
        <Card className={"shadow-2xl"}>
            <Grid container>
                <Grid item xs={4} sm={4} md={2.5}>
                    <Box
                        sx={{
                            width: 115, // match the image width
                            height: 140, // match the image height
                            display: 'flex',
                            justifyContent: 'left',
                            alignItems: 'center',
                            borderRadius: '5px',
                        }}
                    >
                        <img
                            src={props.item.movie.poster}
                            alt={props.item.movie.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'fill',
                                borderRadius: '5px',
                            }}
                        />
                    </Box>

                </Grid>

                <Grid item xs={8} sm={8} md={9}
                    sx={{
                            display: 'flex',
                            justifyContent: 'left',
                            alignItems: 'center',
                            minWidth: 10,
                            }}
                >
                    <Box flexGrow={1}  >

                        <Typography variant="inherit" className={"text-md"}>
                            {props.item.movie.title}
                        </Typography>

                        <Typography variant="inherit" className={"text-sm hidden md:block"}>
                            {props.item.movie.year}
                        </Typography>

                        <Typography  variant="inherit" className={"text-sm block md:hidden"}>
                            {formatPrice(props.item.price)}
                        </Typography>


                        <Box className={"pt-2.5 flex flex-row "}>
                            <QuantityControl item={props.item} mutate={props.mutate}/>
                        </Box>

                    </Box>

                    <Box sx={{paddingRight: 2}} className={"hidden md:block"}>
                        <Typography  variant="h6">
                            {formatPrice(props.item.price)}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Card>
    );
}