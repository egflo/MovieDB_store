import {Layout} from "../components/Layout";
import Box from "@mui/material/Box";
import useSWR from "swr";
import {GetServerSidePropsContext} from "next";
import nookies from "nookies";
import firebase, {auth, axiosInstance} from "../utils/firebase";

import {loadStripe} from '@stripe/stripe-js';
import {Invoice, InvoiceItem} from "../models/Invoice";
import {Card, CardContent, CircularProgress, TextField, Typography} from "@mui/material";
import Button from "@mui/material/Button";
import React, {useEffect, useRef, useState} from "react";
import useToastContext from "../hooks/useToastContext";
import {ToastType} from "../components/Toast";
import Divider from "@mui/material/Divider";
import useAuthContext from "../hooks/useAuthContext";
import {useRouter} from "next/router";
import AddressSelector from "../components/invoice/AddressSelect";
import {Item} from "../models/Item";
import ItemForm from "../components/invoice/ItemForm";
import {AddressElement, CardElement, Elements, PaymentElement, useElements, useStripe}
    from '@stripe/react-stripe-js';



// @ts-ignore
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const INVOICE = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}/invoice`;
const ORDER = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}/`;
const fetcher = (url: string, token: string) =>
    axiosInstance.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.data);

function useCheckout(token: string) {
    const {data, error, mutate} = useSWR<Invoice>([INVOICE, token], fetcher);

    console.log(data)

    return {
        data,
        isLoading: !error && !data,
        isError: error,
        mutate
    }
}


function formatCurrency(price: number) {
    const convert = price / 100;
    return convert.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
}


type ItemFormProps = {
    item: Item;

}



type CheckoutFormProps = {
    setInvoice: (invoice: Invoice) => void;
    invoice: Invoice | null;
}

const CheckoutForm = ({invoice, setInvoice}: CheckoutFormProps) => {
    const ref = useRef(null);
    const toast = useToastContext();
    const auth = useAuthContext();

    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();

    const [errorMessage, setErrorMessage] = useState<string|null>(null);


    const processOrder = async (id: String) => {
        const order_data = {

        }

        //Error promise
        const res = await axiosInstance.post(ORDER, order_data, {
            headers: {

            }
        }).then(res => res.data)
            .catch(err => {
                toast.show(err.message, ToastType.ERROR);
            });
        console.log(res);
    }

    const handleSubmit = async (event: any) => {

        console.log('submitting form');

        // We don't want to let default form submission happen here,
        // which would refresh the page.
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        const result = await stripe.confirmPayment({
            //`Elements` instance that was used to create the Payment Element
            elements,
            confirmParams: {
                return_url: "http://localhost:3000/cart",
            },

            redirect: 'if_required'
        });

        if (result.error) {
            // Show error to your customer (for example, payment details incomplete)
            // @ts-ignore
            setErrorMessage(result.error.message);
            toast.show(result.error.message ?? 'Something went wrong', ToastType.ERROR);
        } else {
            // Your customer will be redirected to your `return_url`. For some payment
            // methods like iDEAL, your customer will be redirected to an intermediate
            // site first to authorize the payment, then redirected to the `return_url`.
            if (result.paymentIntent?.status === 'succeeded') {
                // Show a success message to your customer
                // There's a risk of the customer closing the window before callback
                // execution. Set up a webhook or plugin to listen for the
                // payment_intent.succeeded event that handles any business critical
                // post-payment actions.
                let id = result.paymentIntent?.id;
                toast.show('Order successful', ToastType.SUCCESS);
            }

        }
    };

    if(!invoice) return <div>Loading...</div>;

    return (
        <form onSubmit={handleSubmit}>
            <Box className="container-main">
                <Box className="results-container p-2">

                    <AddressSelector invoice={invoice} setInvoice={setInvoice}/>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="div">
                                Payment Information
                            </Typography>
                            <Divider className={"bg-zinc-500 m-1"}/>
                            <PaymentElement />
                        </CardContent>
                    </Card>
                </Box>

                <Box className="sticky-container p-2">
                    <Card >
                        <CardContent>
                            <Typography variant="h6" component="div">
                                Review and Pay
                            </Typography>
                            <Divider className={"bg-zinc-500 m-1"}/>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    gap: 1
                                }}>
                                {invoice.items.map((item: InvoiceItem) => (
                                    <ItemForm key={item.id} item={item} invoice={invoice} setInvoice={setInvoice} />
                                ))}
                            </Box>


                            <Divider sx={{my: 2}}/>

                            <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={0}>
                                <Box gridColumn="span 8">
                                    <Typography gutterBottom variant="body1" component="div">
                                        Subtotal
                                    </Typography>
                                </Box>
                                <Box gridColumn="span 4">
                                    <Typography gutterBottom variant="body1" component="div" sx={{textAlign: 'end'}}>
                                        {formatCurrency(invoice.subTotal)}
                                    </Typography>
                                </Box>

                                <Box gridColumn="span 8">
                                    <Typography gutterBottom variant="body1" component="div">
                                        Tax
                                    </Typography>
                                </Box>
                                <Box gridColumn="span 4">
                                    <Typography gutterBottom variant="body1" component="div" sx={{textAlign: 'end'}}>
                                        {formatCurrency(invoice.tax)}
                                    </Typography>
                                </Box>

                                <Box gridColumn="span 8">
                                    <Typography gutterBottom variant="body1" component="div" >
                                        Shipping
                                    </Typography>
                                </Box>
                                <Box gridColumn="span 4">
                                    <Typography gutterBottom variant="body1" component="div" sx={{textAlign: 'end'}}>
                                        {formatCurrency(invoice.shipping) || 'Free'}
                                    </Typography>
                                </Box>
                                <Box gridColumn="span 8">
                                    <Typography gutterBottom variant="h6" component="div">
                                        Total
                                    </Typography>
                                </Box>
                                <Box gridColumn="span 4">
                                    <Typography gutterBottom variant="h6" component="div" sx={{textAlign: 'end'}}>
                                        {formatCurrency(invoice.total)}
                                    </Typography>
                                </Box>

                            </Box>

                            <Button variant="contained"
                                    type={"submit"}
                                    sx={{width: '100%', mt: 2}}
                                    disabled={!stripe}
                            >Pay</Button>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
            {errorMessage && <div>{errorMessage}</div>}

        </form>
    )
}



export default function CheckoutPage(props: any) {
    const router = useRouter();
    const [invoice, setInvoice] = useState<Invoice | null>(null);

    const {data, isLoading, isError, mutate} = useCheckout(props.token);


    useEffect(() => {
        if (data) {
            setInvoice(data);
        }
    }, [data]);


    if (isLoading) return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}><CircularProgress></CircularProgress></div>

    if (isError) return router.push('/cart');

    if (!data) return  router.push('/cart');

    const options = {
        // passing the client secret obtained from the server
        clientSecret: data.paymentSheet.paymentIntent,
        appearance: {
            theme: 'night',
            layout: {
                type: 'accordion',
                defaultCollapsed: false,
                radios: true,
                spacedAccordionItems: false
            }
        }
    };


    // @ts-ignore
    return (
        // @ts-ignore
        <Elements stripe={stripePromise} options={options}>
            <CheckoutForm  setInvoice={setInvoice} invoice={invoice}/>
        </Elements>

    );

};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    try {
        //check if user came from cart page
        const cookies = nookies.get(context);

        //const {uid, email} = await firebaseAdmin.auth().verifyIdToken(cookies.token);
        return {
            props: {
                token: cookies.token,
                //uid: uid
            }
        }

    }
    catch (e) {
        return {
            redirect: {
                destination: '/',
            },
            props: {} as never,
        }
    }
}

CheckoutPage.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);