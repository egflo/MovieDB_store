

import React, {useEffect} from 'react';
import {Box, Button, CircularProgress, Grid, InputLabel, Typography} from "@mui/material";
import {Cart} from "../models/Cart";
import Image from "next/image";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Card from "@mui/material/Card";
import Link from "next/link";
import {axiosInstance} from "../utils/firebase";
import useToastContext from "../hooks/useToastContext";
import {ToastType} from "./Toast";
import {useSWRConfig} from "swr";

interface CartItemProps {
    item: Cart;
    mutate: any;
}

function formatPrice(price: number) {
    return price.toLocaleString('en-US', {
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
        axiosInstance.put(`${CART_API}/${props.item.id}`, data).then((response) => {
            if (response.status === 200) {
                toast.show("Cart updated", ToastType.SUCCESS);
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
                toast.show("Cart updated", ToastType.SUCCESS);
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
        <Card>
            <Grid container
                  spacing={0}
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
            >
                <Grid>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'left',
                            alignItems: 'center',
                        }}
                    >
                        <Image
                            src={props.item.movie.poster}
                            alt={props.item.movie.title}
                            width={120}
                            height={170}
                            style={{
                                    objectFit: 'contain',
                                    borderRadius: '5px',
                                }}
                        >
                        </Image>

                    </Box>
                </Grid>

                <Grid item xs={6} sm={8}
                      className={"border-r-0 border-zinc-600 md:border-r-2 md:border-zinc-600"}
                        sx={{
                            display: 'flex',
                            justifyContent: 'left',
                            alignItems: 'center',
                            paddingLeft: 2,
                            }}
                >
                    <Box>
                        <Link href={`/movie/${props.item.movie.id}`}
                                style={{
                                    textDecoration: 'none',
                                }}
                        >
                            <Typography gutterBottom variant="h6">
                                {props.item.movie.title}
                            </Typography>
                        </Link>

                        <Typography gutterBottom variant="subtitle2">
                            {props.item.movie.year}
                        </Typography>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                        }}>
                            <FormControl sx={{width: 80 }} size="small">
                                <Select
                                    native
                                    value={quantity}
                                    onChange={(event) => {
                                        onUpdate(event.target.value as number);
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
                            <Button
                                className={"bg-blue-800 hidden md:block"}
                                onClick={onDelete}
                                variant="contained"
                                color="primary"
                            >Remove</Button>
                        </Box>

                    </Box>

                </Grid>
                <Grid item xs={2} sm={2}
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                >
                    <Typography  variant="h6">
                        {formatPrice(props.item.price)}
                    </Typography>
                </Grid>
            </Grid>
        </Card>
    );
}