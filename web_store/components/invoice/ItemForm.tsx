import {Item} from "../../models/Item";
import Box from "@mui/material/Box";
import {Typography} from "@mui/material";
import React from "react";
import {ToastType} from "../Toast";
import {auth, axiosInstance} from "../../utils/firebase";
import useToastContext from "../../hooks/useToastContext";
import {Cart} from "../../models/Cart";
import {Invoice, InvoiceItem} from "../../models/Invoice";
import {useRouter} from "next/router";
import useAuthContext from "../../hooks/useAuthContext";

function formatCurrency(price: number) {
    const convert = price / 100;
    return convert.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
}

const INVOICE_URL = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}/invoice`;
const CART_API:string = `${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/cart`;

const MAX_QUANTITY = 4;

type ItemFormProps = {
    item: InvoiceItem;
    invoice: Invoice;
    setInvoice: (invoice: Invoice) => void;
}

const ItemForm = ({item, invoice, setInvoice}: ItemFormProps) => {
    const [quantity, setQuantity] = React.useState(item.quantity);
    const toast = useToastContext();
    const router = useRouter();
    const useAuth = useAuthContext();


    async function onCartUpdate() {
            try {
                if (!useAuth.isAuthenticated) {
                    toast.show("You must be logged in to add an address", ToastType.ERROR);
                    return;
                }

                if(!invoice.address) {
                    toast.show("No address found", ToastType.ERROR);
                    return;
                }

                let address = invoice.address

                let addressRequest = {
                    firstName: address.firstName,
                    lastName: address.lastName,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    postcode: address.postalCode,
                    country: address.country,
                }
                const json = JSON.stringify(addressRequest);

                const token = await auth.currentUser?.getIdToken();
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const response = await axiosInstance.post(INVOICE_URL, json);
                //update invoice
                setInvoice(response.data);

                return
            } catch (error) {
                console.error('Failed to update invoice', error);
                toast.show("Failed to update invoice", ToastType.ERROR);
            }

    }

    async function onUpdate(value: number) {

        if(value > MAX_QUANTITY) {
            toast.show("Max quantity is 4", ToastType.ERROR);
            return;
        }

        let data = {
            id: item.id,
            userId: item.userId,
            itemId: item.itemId,
            quantity: value
        }
        // update the cart
        axiosInstance.post(`${CART_API}/`, data).then((response) => {
            if (response.status === 200) {
                //toast.show("CartButton updated", ToastType.SUCCESS);
                setQuantity(value);
                //update invoice
                onCartUpdate();

            } else {
                toast.show("Could not update cart", ToastType.ERROR);
            }
        });
    }

    async function onDelete() {
        axiosInstance.delete(`${CART_API}/${item.id}`).then((response) => {
            if (response.status === 200) {
                //toast.show("Item deleted", ToastType.SUCCESS);
                //update invoice
                onCartUpdate();

            } else {
                toast.show("Could not delete item", ToastType.ERROR);
            }
        });
    }

    // @ts-ignore
    return (
        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
        <Box gridColumn="span 3">
            <img
                src={item.image}
                alt={item.name}
                style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px'}}
            />
        </Box>

        <Box gridColumn="span 7" className={"pr-2"}>
            <Typography gutterBottom variant="inherit" component="div">
                {item.name}
            </Typography>

            <select
                value={quantity}
                onChange={(e) => onUpdate(parseInt(e.target.value))}
                style={{
                    fontSize: '1rem',
                    padding: '0.5rem',
                    borderRadius: '5px',
                    width: '50px',
                    outline: 'none',
                    cursor: 'pointer',
                }}
            >
                {Array.from({length: MAX_QUANTITY}, (_, i) => i + 1).map((value) => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </select>
        </Box>
        <Box gridColumn="span 2">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'end'

                }}>
                <Typography gutterBottom variant="body1" component="div" sx={{m: 0, p: 0}}>
                    {formatCurrency(item.price)}
                </Typography>

                <Typography gutterBottom variant="subtitle2" component="div" sx={{m: 0, p: 0}}>
                    Qty: {item.quantity}
                </Typography>

                <button
                    onClick={onDelete}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#0070f3',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        outline: 'none',
                        padding: '0',
                    }}

                >Remove
                </button>

            </Box>

        </Box>
    </Box>
    );
}

export default ItemForm;