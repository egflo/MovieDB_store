

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
interface CartItemProps {
    item: Cart;
}


let CART = "inventory-service/cart";

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
        axiosInstance.put(`${CART}/${props.item.id}`, data).then((response) => {
            if (response.status === 200) {
                toast.show("Cart updated", ToastType.SUCCESS);
                setQuantity(value);
            } else {
                toast.show("Could not update cart", ToastType.ERROR);
            }
        });
    }

    function onDelete() {
        axiosInstance.delete(`${CART}/${props.item.id}`).then((response) => {
            if (response.status === 200) {
                toast.show("Cart updated", ToastType.SUCCESS);
            } else {
                toast.show("Could not delete item", ToastType.ERROR);
            }
        });

    }

    useEffect(() => {
        console.log("Quantity changed");
    }, [quantity]);


    return (
        <Card
            sx={{
                minWidth: 500,

                color: theme => theme.palette.text.primary,
            }}
        >
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

                <Grid item xs={8} sm={8}
                        sx={{
                            display: 'flex',
                            justifyContent: 'left',
                            alignItems: 'center',
                            borderRight: '1px solid grey',
                            paddingLeft: 2,
                            }}
                >
                    <Box>
                        <Link href={`/movie/${props.item.movie.id}`}
                                style={{
                                    textDecoration: 'none',
                                }}
                        >
                            <Typography gutterBottom variant="h5">
                                {props.item.movie.title}
                            </Typography>
                        </Link>

                        <Typography gutterBottom variant="subtitle1">
                            {props.item.movie.year}
                        </Typography>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                        }}>
                            <FormControl sx={{width: 120 }} size="small">
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
                    <Typography gutterBottom variant="h5">
                        {props.item.price}
                    </Typography>
                </Grid>
            </Grid>
        </Card>
    );
}