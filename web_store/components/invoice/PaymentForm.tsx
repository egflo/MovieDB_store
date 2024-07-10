// components/PaymentForm.tsx
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState, useEffect, FormEvent } from 'react';
import {Invoice} from "../../models/Invoice";

interface User {
    id: string;
    stripeCustomerId: string;
}

interface PaymentMethod {
    card: {
        last4: string;
    };
}

const PaymentForm = ({ invoice, setInvoice }: { invoice: Invoice, setInvoice: (invoice: Invoice) => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedPaymentMethod, setSavedPaymentMethod] = useState<PaymentMethod | null>(null);
    const [useSavedPaymentMethod, setUseSavedPaymentMethod] = useState(true);

    useEffect(() => {
        const fetchSavedPaymentMethod = async () => {
            const response = await fetch('/api/get_saved_payment_method');
            const data = await response.json();
            if (data.paymentMethod) {
                setSavedPaymentMethod(data.paymentMethod);
            }
        };

        fetchSavedPaymentMethod();
    }, []);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            setLoading(false);
            return;
        }

        if (useSavedPaymentMethod && savedPaymentMethod) {
            // Handle payment with saved payment method
            console.log('Using saved payment method', savedPaymentMethod);
            setLoading(false);
        } else {
            const cardElement = elements.getElement(CardElement);

            if (!cardElement) {
                setError('Card element not found');
                setLoading(false);
                return;
            }

            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                //setError(error.message);
                setLoading(false);
            } else {
                const response = await fetch('/api/save_payment_method', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ paymentMethodId: paymentMethod?.id }),
                });

                const result = await response.json();

                if (result.error) {
                    setError(result.error);
                } else {
                    console.log('Payment method saved!', result);
                }

                setLoading(false);
            }
        }
    };

    return (
        <div>
            {savedPaymentMethod ? (
                <div>
                    <h4>Saved Payment Method</h4>
                    <p>Card ending in {savedPaymentMethod.card.last4}</p>
                    <label>
                        <input
                            type="checkbox"
                            checked={useSavedPaymentMethod}
                            onChange={(e) => setUseSavedPaymentMethod(e.target.checked)}
                        />
                        Use saved payment method
                    </label>
                </div>
            ) : null}
            {!useSavedPaymentMethod && (
                <form onSubmit={handleSubmit}>
                    <CardElement />
                    <button type="submit" disabled={!stripe || loading}>
                        {loading ? 'Processing...' : 'Save Payment Method'}
                    </button>
                    {error && <div>{error}</div>}
                </form>
            )}
        </div>
    );
};

export default PaymentForm;
