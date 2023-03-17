import {Layout} from "../components/Layout";
import Box from "@mui/material/Box";
import useSWR from "swr";
import {GetServerSidePropsContext} from "next";
import nookies from "nookies";
import firebase, {auth, axiosInstance} from "../utils/firebase";
import {Elements, PaymentElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import {Checkout, Item} from "../models/Checkout";
import * as yup from "yup";
import {Card, CardContent, CircularProgress, TextField, Typography} from "@mui/material";
import {Field, Form, Formik} from "formik";
import Button from "@mui/material/Button";
import {useRef} from "react";
import useToastContext from "../hooks/useToastContext";
import {ToastType} from "../components/Toast";
import Divider from "@mui/material/Divider";
import useAuthContext from "../hooks/useAuthContext";
import {useRouter} from "next/router";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const options = [
    {value: 'CA', label: 'California'}]


// @ts-ignore
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const CHECKOUT = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}/checkout?postalCode=90805`;
const ORDER = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}/`;
const fetcher = (url: string, token: string) =>
    axiosInstance.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.data);

function useCheckout(token: string) {
    const {data, error, mutate} = useSWR<Checkout>([CHECKOUT, token], fetcher);

    return {
        data,
        isLoading: !error && !data,
        isError: error,
        mutate
    }
}


function formatCurrency(price: number) {
    return price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
}

type FormProps = {
    ref: any;
}

const schema = yup.object().shape({
    firstname: yup.string()
        .required("First name is required"),
    lastname: yup.string()
        .required("Last name is required"),
    unit: yup.string(),
    street: yup.string()
        .min(5, "Too Short!")
        .required("Street is required"),
    city: yup.string()
        .min(2, "Too Short!")
        .required("City is required"),
    state: yup.string()
        .required("State is required")
        .oneOf(options.map(o => o.value)),
    postcode: yup.string()
        .matches(/^[0-9]+$/, "Must be only digits")
        .min(5, "Too Short!")
        .required("Postcode is required")
});

const AddressForm = ({ref}: FormProps) => {

    return (

        <></>
    )
}


type ItemFormProps = {
    item: Item;

}

const ItemForm = ({item}: ItemFormProps) => {
    return (
        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
            <Box gridColumn="span 3">
                <img
                    src={item.image}
                    alt={item.name}
                    style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px'}}
                />
            </Box>

            <Box gridColumn="span 7">
                <Typography gutterBottom variant="subtitle1" component="div">
                    {item.name}
                </Typography>
            </Box>
            <Box gridColumn="span 2">
                <Box
                    sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'end'

                        }}>
                    <Typography gutterBottom variant="h6" component="div" sx={{m:0, p:0}}>
                         {formatCurrency(item.price)}
                    </Typography>

                    <Typography gutterBottom variant="subtitle2" component="div" sx={{m:0, p:0}}>
                        Qty: {item.quantity}
                    </Typography>

                    <button
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#0070f3',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            outline: 'none',
                            padding: '0',
                        }}

                    >Remove</button>

                </Box>

            </Box>
        </Box>
    )
}

type CheckoutFormProps = {
    data: Checkout;
}

const CheckoutForm = ({data}: CheckoutFormProps) => {
    const ref = useRef(null);
    const toast = useToastContext();
    const auth = useAuthContext();

    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();


    const processOrder = async () => {
        const order_data = {
            userId:  data.userId,
            paymentId: data.paymentIntentId,
            shipping : {
                firstName: ref.current.values.firstname,
                lastName: ref.current.values.lastname,
                unit: ref.current.values.unit,
                street: ref.current.values.street,
                city: ref.current.values.city,
                postcode: ref.current.values.postcode,
            }

        }

        //Error promise
        const res = await axiosInstance.post(ORDER, order_data, {
            headers: {

            }
        });
        console.log(res);
    }

    const handleSubmit = async (event: any) => {
        // We don't want to let default form submission happen here,
        // which would refresh the page.
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        if (ref.current) {
            // @ts-ignore
            ref.current.submitForm();
        }
        else {
            return;
        }

        const result = await stripe.confirmPayment({
            //`Elements` instance that was used to create the Payment Element
            elements,
            confirmParams: {

                return_url: "http://localhost:3000/checkout",
            },

            redirect: 'if_required'
        });

        if (result.error) {
            // Show error to your customer (for example, payment details incomplete)
            toast.show(result.error.message ?? 'Something went wrong', ToastType.ERROR);
        } else {
            // Your customer will be redirected to your `return_url`. For some payment
            // methods like iDEAL, your customer will be redirected to an intermediate
            // site first to authorize the payment, then redirected to the `return_url`.
            console.log(result);
            if (result.paymentIntent?.status === 'succeeded') {
                // Show a success message to your customer
                // There's a risk of the customer closing the window before callback
                // execution. Set up a webhook or plugin to listen for the
                // payment_intent.succeeded event that handles any business critical
                // post-payment actions.
                await processOrder();
                toast.show('Order successful'
                    , ToastType.SUCCESS);
                router.push('/');
            }

        }
    };

    return (
        <>
            <Box className="container-main">
                <Box className="results-container">
                    <Card>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                Address Information
                            </Typography>
                            <Formik
                                innerRef={ref}
                                initialValues={{
                                    firstname: '',
                                    lastname: '',
                                    unit: '',
                                    street: '',
                                    city: '',
                                    state: '',
                                    postcode: '',
                                }}
                                validationSchema={schema}
                                onSubmit={(values) => {
                                    console.log(values);
                                }}
                            >
                                {({ errors, touched }) => (
                                    <Form>
                                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
                                            <Box gridColumn="span 8">
                                                <div>
                                                    <Field as={TextField} name="firstname" label="First Name" variant="outlined" style={{ width: '100%'}} />
                                                    {errors.firstname && touched.firstname ? (
                                                        <div className="error">{errors.firstname}</div>
                                                    ) : null}
                                                </div>
                                            </Box>

                                            <Box gridColumn="span 4">
                                                <div>
                                                    <Field as={TextField} name="lastname" label="Last Name" variant="outlined" style={{ width: '100%'}}/>
                                                    {errors.lastname && touched.lastname ? (
                                                        <div className="error">{errors.lastname}</div>
                                                    ) : null}
                                                </div>
                                            </Box>

                                            <Box gridColumn="span 4">
                                                <div>
                                                    <Field as={TextField} name="unit" label="Unit" variant="outlined" style={{ width: '100%'}} />
                                                    {errors.unit && touched.unit ? (
                                                        <div className="error">{errors.unit}</div>
                                                    ) : null}
                                                </div>
                                            </Box>

                                            <Box gridColumn="span 8">
                                                <div>
                                                    <Field as={TextField} name="street" label="Street" variant="outlined" style={{ width: '100%'}} />
                                                    {errors.street && touched.street ? (
                                                        <div className="error">{errors.street}</div>
                                                    ) : null}
                                                </div>
                                            </Box>

                                            <Box gridColumn="span 8">
                                                <div>
                                                    <Field as={TextField} name="city" label="City" variant="outlined" style={{ width: '100%'}} />
                                                    {errors.city && touched.city ? (
                                                        <div className="error">{errors.city}</div>
                                                    ) : null}
                                                </div>
                                            </Box>

                                            <Box gridColumn="span 4">
                                                <div>
                                                    <Field as={Select} name="state" label="State" variant="outlined" style={{ width: '100%'}}>
                                                        <MenuItem value="CA">California</MenuItem>
                                                        <MenuItem value="TX">Texas</MenuItem>
                                                        <MenuItem value="NY">New York</MenuItem>
                                                    </Field>

                                                    {errors.state && touched.state ? (
                                                        <div className="error">{errors.state}</div>
                                                    ) : null}
                                                </div>
                                            </Box>

                                            <Box gridColumn="span 4">
                                                <div>
                                                    <Field as={TextField} name="postcode" label="Postcode" variant="outlined" style={{ width: '100%'}} />
                                                    {errors.postcode && touched.postcode ? (
                                                        <div className="error">{errors.postcode}</div>
                                                    ) : null}
                                                </div>
                                            </Box>
                                        </Box>
                                        <br />
                                    </Form>
                                )}
                            </Formik>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                Payment Information
                            </Typography>
                            <PaymentElement />
                        </CardContent>
                    </Card>
                </Box>

                <Box className="sticky-container">
                    <Card >
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                Order Summary
                            </Typography>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    gap: 1
                                }}>
                                {data.items.map((item: Item) => (
                                    <ItemForm key={item.id} item={item}/>
                                ))}
                            </Box>


                            <Divider sx={{my: 2}}/>

                            <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={0}>
                                <Box gridColumn="span 8">
                                    <Typography gutterBottom variant="subtitle1" component="div">
                                        Subtotal
                                    </Typography>
                                </Box>
                                <Box gridColumn="span 4">
                                    <Typography gutterBottom variant="subtitle1" component="div" sx={{textAlign: 'end'}}>
                                        {formatCurrency(data.subTotal)}
                                    </Typography>
                                </Box>

                                <Box gridColumn="span 8">
                                    <Typography gutterBottom variant="subtitle1" component="div">
                                        Tax
                                    </Typography>
                                </Box>
                                <Box gridColumn="span 4">
                                    <Typography gutterBottom variant="subtitle1" component="div" sx={{textAlign: 'end'}}>
                                        {formatCurrency(data.tax)}
                                    </Typography>
                                </Box>

                                <Box gridColumn="span 8">
                                    <Typography gutterBottom variant="subtitle1" component="div" >
                                        Shipping
                                    </Typography>
                                </Box>
                                <Box gridColumn="span 4">
                                    <Typography gutterBottom variant="subtitle1" component="div" sx={{textAlign: 'end'}}>
                                        {formatCurrency(data.shipping) || 'Free'}
                                    </Typography>
                                </Box>
                                <Box gridColumn="span 8">
                                    <Typography gutterBottom variant="h5" component="div">
                                        Total
                                    </Typography>
                                </Box>
                                <Box gridColumn="span 4">
                                    <Typography gutterBottom variant="h5" component="div" sx={{textAlign: 'end'}}>
                                        {formatCurrency(data.total)}
                                    </Typography>
                                </Box>

                            </Box>

                            <Button variant="contained"
                                    onClick={handleSubmit}
                                    sx={{width: '100%', mt: 2}}
                                    disabled={!stripe}
                            >Pay</Button>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </>
    )
}


export default function CheckoutPage(props: any) {

    const {data, isLoading, isError, mutate} = useCheckout(props.token);

    console.log(isError);

    if (isLoading) return <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}><CircularProgress></CircularProgress></Box>


    if (isError) return <Box><Typography>{isError.error.message}</Typography></Box>

    if (!data) return  <Box><Typography>Failed to load. Try again later.</Typography></Box>
    const options = {
        // passing the client secret obtained from the server
        clientSecret: data.clientSecret
    };


    return (
        <Elements stripe={stripePromise} options={options}>
            <CheckoutForm data={data}/>
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