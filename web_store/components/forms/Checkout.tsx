import {PaymentElement, useElements, useStripe} from '@stripe/react-stripe-js';
import Button from "@mui/material/Button";
import {Card, CardContent, TextField, Typography} from "@mui/material";
import * as yup from "yup";
import {Field, Form, Formik} from "formik";
import Box from "@mui/material/Box";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import {useRef, useState} from "react";
import useToastContext from "../../hooks/useToastContext";
import {ToastType} from "../Toast";
import useAuthContext from "../../hooks/useAuthContext";


type FormProps = {
    ref: any;
    handleNext: () => void;
    handleBack: () => void;
    activeStep: number;
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
    postcode: yup.string()
        .matches(/^[0-9]+$/, "Must be only digits")
        .min(5, "Too Short!")
        .required("Postcode is required")
});

const AddressForm = ({ref, handleNext, handleBack, activeStep}: FormProps) => {

    return (
        <Card sx={{ width: '100%' }}>
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
                        postcode: '',
                    }}
                    validationSchema={schema}
                    onSubmit={(values) => {
                        console.log(values);
                        handleNext();
                    }}
                >
                    {({ errors, touched }) => (
                        <Form>
                            <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
                                <Box gridColumn="span 8">
                                    <div>
                                        <Field as={TextField} name="firstname" label="First Name" variant="outlined" style={{ width: '100%'}} />
                                        {errors.firstname && touched.firstname ? (
                                            <div>{errors.firstname}</div>
                                        ) : null}
                                    </div>
                                </Box>

                                <Box gridColumn="span 4">
                                    <div>
                                        <Field as={TextField} name="lastname" label="Last Name" variant="outlined" style={{ width: '100%'}}/>
                                        {errors.lastname && touched.lastname ? (
                                            <div>{errors.lastname}</div>
                                        ) : null}
                                    </div>
                                </Box>

                                <Box gridColumn="span 4">
                                    <div>
                                        <Field as={TextField} name="unit" label="Unit" variant="outlined" style={{ width: '100%'}} />
                                        {errors.unit && touched.unit ? (
                                            <div>{errors.unit}</div>
                                        ) : null}
                                    </div>
                                </Box>

                                <Box gridColumn="span 8">
                                    <div>
                                        <Field as={TextField} name="street" label="Street" variant="outlined" style={{ width: '100%'}} />
                                        {errors.street && touched.street ? (
                                            <div>{errors.street}</div>
                                        ) : null}
                                    </div>
                                </Box>

                                <Box gridColumn="span 8">
                                    <div>
                                        <Field as={TextField} name="city" label="City" variant="outlined" style={{ width: '100%'}} />
                                        {errors.city && touched.city ? (
                                            <div>{errors.city}</div>
                                        ) : null}
                                    </div>
                                </Box>

                                <Box gridColumn="span 4">
                                    <div>
                                        <Field as={TextField} name="postcode" label="Postcode" variant="outlined" style={{ width: '100%'}} />
                                        {errors.postcode && touched.postcode ? (
                                            <div>{errors.postcode}</div>
                                        ) : null}
                                    </div>
                                </Box>
                            </Box>
                            <br />
                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                <Button disabled={activeStep === 0} onClick={handleBack}>
                                    Back
                                </Button>
                                <Button type="submit" variant="contained">
                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </CardContent>
        </Card>
    )
}

const PaymentForm = ( {handleNext, handleBack, activeStep}: FormProps) => {
    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    Payment Information
                </Typography>
                <PaymentElement />

                <br />

                <Box>
                    <Button disabled={activeStep === 0} onClick={handleBack}>
                        Back
                    </Button>
                    <Button variant="contained" onClick={handleNext}>
                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    )
}

const Review = ({handleNext, handleBack, activeStep}: FormProps) => {
    const CART = 'inventory-service/cart/';
    const auth = useAuthContext();



    const stripe = useStripe();
    const elements = useElements();
    const toast = useToastContext();

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
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
                return_url: "https://example.com/order/123/complete",
            },
        });

        if (result.error) {
            // Show error to your customer (for example, payment details incomplete)
            console.log(result.error.message);
            toast.show(result.error.message ? result.error.message : "Something went wrong", ToastType.ERROR);

        } else {
            // Your customer will be redirected to your `return_url`. For some payment
            // methods like iDEAL, your customer will be redirected to an intermediate
            // site first to authorize the payment, then redirected to the `return_url`.
        }
    };

    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    Review Order
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Button disabled={!stripe} variant={"contained"} type="submit">Confirm</Button>
                </form>

            </CardContent>
            <Box>
                <Button disabled={activeStep === 0} onClick={handleBack}>
                    Back
                </Button>
                <Button variant="contained" onClick={handleNext}>
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
            </Box>
        </Card>

    )
}

const steps = ['Address', 'Payment', 'Review'];

const CheckoutForm = () => {
    const [activeStep, setActiveStep] = useState(0);
    const ref = useRef(null);


    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return <AddressForm ref = {ref} handleBack={handleBack} handleNext={handleNext} activeStep={activeStep} />;
            case 1:
                return <PaymentForm ref = {null} handleBack={handleBack} handleNext={handleNext} activeStep={activeStep} />;
            case 2:
                return <Review ref = {null} handleBack={handleBack} handleNext={handleNext} activeStep={activeStep} />;
        }
    }

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
        <Box sx={{ width: '100%', p:2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Box>
                {activeStep === steps.length ? (
                    <Box>
                        <Typography>All steps completed - you&apos;re finished</Typography>
                        <Button onClick={handleBack}>Back</Button>
                    </Box>
                ) : (
                    <Box>
                        <Box sx={{p:2}}>
                            {getStepContent(activeStep)}

                        </Box>

                    </Box>
                )}
            </Box>
        </Box>

    )
};

export default CheckoutForm;
