import React, {useState} from 'react';
import Button from "@mui/material/Button";
import useToastContext from "../../hooks/useToastContext";
import {ToastType} from "../Toast";
import {axiosInstance, auth} from "../../utils/firebase";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import Box from "@mui/material/Box";


const API_CART:string = `${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/cart/`;


type CartProps = {
    itemId: string;
}

export default function CartExpanded({itemId}: CartProps) {
    const {show} = useToastContext();
    const [quantity, setQuantity] = useState("1");

    const addToCart = async () => {
        if (auth.currentUser != null) {
            const token = await auth.currentUser?.getIdToken(true);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            axiosInstance.post(API_CART, {
                itemId: itemId,
                userId: auth.currentUser?.uid,
                quantity: Number(quantity),
            }).then((response) => {
                console.log(response);
                show("Added to cart", ToastType.INFO);

            }).catch((error) => {
                show("Could not add to cart", ToastType.ERROR);
            });
        }
        else {
            show("You must be logged in to add to cart", ToastType.ERROR);
        }

    }
    const handleChange = (event: SelectChangeEvent) => {
        setQuantity(event.target.value);
    };

    return (
        <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>

            <FormControl sx={{ m: 1 }} size="small">
                <InputLabel id="select">Qty</InputLabel>
                <Select
                    labelId="select"
                    id="select"
                    value={quantity}
                    label="Qty"
                    onChange={handleChange}
                >
                    <MenuItem value={"1"}>1</MenuItem>
                    <MenuItem value={"2"}>2</MenuItem>
                    <MenuItem value={"3"}>3</MenuItem>
                    <MenuItem value={"4"}>4</MenuItem>
                </Select>
            </FormControl>

            <Button onClick={addToCart} variant="contained" color="primary">
                Add to cart
            </Button>
        </Box>

    );
}