import React, { useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import {Card, CardContent} from "@mui/material";
import {auth, axiosInstance} from "../../utils/firebase";
import {ToastType} from "../Toast";
import {PaymentMethod} from "@stripe/stripe-js";

const PAYMENT_API : string = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}/users/payment-methods/`


interface AddPaymentMethodFormProps {
    handleClose: () => void;
    onPaymentMethodAdded: (paymentMethod: any) => void;
}

const AddPaymentMethodForm: React.FC<AddPaymentMethodFormProps> = ({ handleClose, onPaymentMethodAdded }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function  onClose() {

        //elements.getElement(CardElement).clear();

        // @ts-ignore
        elements.getElement(CardNumberElement).clear();
        // @ts-ignore
        elements.getElement(CardExpiryElement).clear();
        // @ts-ignore
        elements.getElement(CardCvcElement).clear();

        handleClose();
    }


    const handleSubmit = async (event: React.FormEvent) => {

        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            setError("Stripe or Elements not loaded")
            setLoading(false);
            return;
        }

        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement) {
            setLoading(false);
            setError('Card number element not found')
            return;
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            setLoading(false);
            // @ts-ignore
            setError(error.message)
            return;
        }


        const user = auth.currentUser;
        if (user) {
            const idToken = await user.getIdToken(true);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

            try {
                const response = await axiosInstance.put(PAYMENT_API + paymentMethod.id);
                if (response.status == 200) {
                    onPaymentMethodAdded(paymentMethod?.id);
                } else {
                    const errorData = await response.data();
                    setError(errorData.error);
                }

            } catch (error) {
                // @ts-ignore
                console.log(error)
            }
        } else {

        }
        setLoading(false);
    };

    return (
        <Card className={"w-full md:w-2/4"}>
            <form onSubmit={handleSubmit}
                  className="space-y-6 max-w-md mx-auto m-8 p-4 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Add Payment Method</h2>
                <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-white-700 mb-2">Card
                        Number</label>
                    <div className=" rounded p-2 text-white-700 bg-white">
                        <CardNumberElement
                            id="cardNumber"
                            className="w-full p-2"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="cardExpiry" className="block text-sm font-medium text-white-700 mb-2">Expiration
                        Date</label>
                    <div className=" rounded p-2 bg-white">
                        <CardExpiryElement id="cardExpiry" className="w-full p-2"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="cardCvc" className="block text-sm font-medium text-white-700 mb-2">CVC</label>
                    <div className=" rounded p-2 bg-white">
                        <CardCvcElement id="cardCvc" className="w-full p-2"/>
                    </div>
                </div>
                {error && <p className="text-red-600">{error}</p>}
                <button type="submit" disabled={!stripe || loading}
                        className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 disabled:bg-blue-300">
                    {loading ? 'Saving...' : 'Add Payment Method'}
                </button>
                <button type="button" disabled={!stripe || loading}
                        onClick={onClose}
                        className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 disabled:bg-blue-300">
                    {'Cancel'}
                </button>
            </form>
        </Card>
    );
};

export default AddPaymentMethodForm;
