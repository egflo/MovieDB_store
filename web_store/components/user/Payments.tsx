import { useState, useEffect, Key} from 'react';
import useSWR, {mutate} from 'swr';
import {
    Backdrop,
    Card,
    CardContent,
    CircularProgress,
    Typography
} from '@mui/material';
import {useRouter} from 'next/router';
import {auth} from "../../utils/firebase";
import {axiosInstance} from "../../utils/firebase";
import Box from "@mui/material/Box";
import CardActions from "@mui/material/CardActions";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import {PaymentMethod} from "../../models/PaymentMethod";
import PaymentForm from "../../components/forms/PaymentForm";
import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import {fetchPaymentMethods} from "../../api/fetcher";
import {Add, CreditCardRounded} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";

const PAYMENT_URL = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}/users/payment-methods`;

// @ts-ignore
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);


function capitalizeFirstLetter(str: string): string {
    if (!str) return str; // Handle empty or null strings
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function Payments() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const handleClose = () => {
        setOpen(false);
    };
    const handleOpen = () => {
        setOpen(true);
    };
    const {data, error, mutate} = useSWR('payments', fetchPaymentMethods);


    const handlePaymentMethodAdded = (paymentMethod: String) => {
        //setPaymentMethods([...paymentMethods, paymentMethod]);
        console.log("PAyment addded")
        mutate();
    };


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            // @ts-ignore
            setUser(authUser); // Set user when authentication state changes
        });

        return () => unsubscribe(); // Cleanup on component unmount
    }, []);


    function onDefault(id: string) {
        // Set the default address with a PUT request capture errors insert token
        auth.currentUser?.getIdToken(true).then((token) => {
            axiosInstance.post(`${PAYMENT_URL}/default/${id}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(() => {
                    mutate(); // Refresh the data
                })
                .catch((error) => {
                    console.error('Failed to set default payment', error);
                });
        });
    }

    function onDelete(id: string) {
        // Delete the address with a DELETE request capture errors insert token

        auth.currentUser?.getIdToken(true).then((token) => {

            axiosInstance.delete(`${PAYMENT_URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(() => {
                    mutate(); // Refresh the data
                })
                .catch((error) => {
                    console.error('Failed to delete payment', error);
                });
        });
    }

    if (error) {
        return <Typography>Error fetching payment methods: {error.message}</Typography>;
    }

    if (!data) {
        return <CircularProgress/>;
    }

    return (
        <Box className="container-fluid">

            <Box className={"flex justify-end m-auto"}>
                <IconButton onClick={handleOpen}>
                    <Add color={"primary"} fontSize={"large"}/>
                </IconButton>
            </Box>

            <Box className="flex gap-2 flex-col md:flex-row flex-wrap justify-center">

                {data.map((paymentMethod: PaymentMethod, index: Key | null | undefined) => (
                    <Box key={index}>

                        <Card className={"w-full md:w-96"}>

                            <CardContent>
                                <Box className="flex gap-2 justify-between">
                                    <Box className="flex flex-col gap-2">
                                        <Typography variant="h6">
                                            {capitalizeFirstLetter(paymentMethod.brand)} ending in {paymentMethod.card.last4}
                                        </Typography>
                                        <Typography variant="body1">
                                            Expires {paymentMethod.card.exp_month}/{paymentMethod.card.exp_year}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <img
                                            src={`../cards/${paymentMethod.brand.toLowerCase()}.svg`}
                                            alt={paymentMethod.brand}
                                            className={"h-8"}
                                        />
                                    </Box>
                                </Box>

                            </CardContent>
                            <Divider className={"h-2"}/>

                            <CardActions>

                                <Box
                                    className="d-flex gap-2 w-full justify-content-between"
                                    // Hide on small screens, show on medium and larger
                                >

                                    { !paymentMethod.isDefault &&
                                        <Button className="btn-primary"
                                                onClick={() => onDefault(paymentMethod.id)}>Set Default</Button>
                                    }


                                    <Box className="d-flex gap-2">
                                        <Button className="btn-primary">Edit</Button>

                                        <Button className="text-red-700"
                                                onClick={() => onDelete(paymentMethod.id)}>Delete</Button>
                                    </Box>
                                </Box>

                            </CardActions>

                        </Card>
                    </Box>
                ))}
            </Box>

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={open}
            >
                <Elements stripe={stripePromise}>
                    <PaymentForm
                        handleClose={handleClose}
                        onPaymentMethodAdded={handlePaymentMethodAdded} />
                </Elements>
            </Backdrop>
        </Box>
    );
}

