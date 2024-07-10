import React, { useState, useEffect } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useElements, useStripe } from '@stripe/react-stripe-js';
import axios from 'axios';
import {Card} from "@mui/material";
import {scalarOptions} from "yaml";
import Str = scalarOptions.Str;


interface EditPaymentMethodForm {
    paymentMethodId: String;
    onClose: () => void;
}

function EditPaymentMethodForm({ paymentMethodId, onClose }) {
    const stripe = useStripe();
    const elements = useElements();

    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardExpiry: '',
        cardCvc: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch the payment method details from your backend
        axios.get(`/api/payment-methods/${paymentMethodId}`)
            .then(response => {
                const { card } = response.data;
                setCardDetails({
                    cardNumber: '**** **** **** ' + card.last4,
                    cardExpiry: card.exp_month + '/' + card.exp_year,
                    cardCvc: '***'
                });
            })
            .catch(err => {
                setError('Failed to load payment method details.');
            });
    }, [paymentMethodId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const cardElement = elements.getElement(CardNumberElement);
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        axios.post('/api/payment-methods/update', {
            paymentMethodId: paymentMethod.id,
        })
            .then(response => {
                onClose();
            })
            .catch(err => {
                setError('Failed to update payment method.');
                setLoading(false);
            });
    };

    const handleClose = () => {
        setCardDetails({
            cardNumber: '',
            cardExpiry: '',
            cardCvc: ''
        });
        setError(null);
        onClose();
    };

    return (
        <Card className={"w-full md:w-2/4"}>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto m-8 p-4 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Edit Payment Method</h2>
                <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-white-700 mb-2">Card Number</label>
                    <div className="rounded p-2 text-white-700 bg-white">
                        <CardNumberElement id="cardNumber" className="w-full p-2" />
                    </div>
                </div>
                <div>
                    <label htmlFor="cardExpiry" className="block text-sm font-medium text-white-700 mb-2">Expiration Date</label>
                    <div className="rounded p-2 bg-white">
                        <CardExpiryElement id="cardExpiry" className="w-full p-2" />
                    </div>
                </div>
                <div>
                    <label htmlFor="cardCvc" className="block text-sm font-medium text-white-700 mb-2">CVC</label>
                    <div className="rounded p-2 bg-white">
                        <CardCvcElement id="cardCvc" className="w-full p-2" />
                    </div>
                </div>
                {error && <p className="text-red-600">{error}</p>}
                <button type="submit" disabled={!stripe || loading}
                        className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 disabled:bg-blue-300">
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" disabled={loading}
                        onClick={handleClose}
                        className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 disabled:bg-blue-300">
                    Cancel
                </button>
            </form>
        </Card>
    );
}

export default EditPaymentMethodForm;
