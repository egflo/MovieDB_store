package com.order_service.dto;


import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeError;

public class PaymentIntentDTO {
    private PaymentIntent paymentIntent;
    private StripeException stripeError;

    public PaymentIntentDTO() {
    }

    public PaymentIntentDTO(PaymentIntent paymentIntent, StripeException stripeError) {
        this.paymentIntent = paymentIntent;
        this.stripeError = stripeError;
    }

    public PaymentIntent getPaymentIntent() {
        return paymentIntent;
    }

    public void setPaymentIntent(PaymentIntent paymentIntent) {
        this.paymentIntent = paymentIntent;
    }

    public StripeException getStripeError() {
        return stripeError;
    }

    public void setStripeError(StripeException stripeError) {
        this.stripeError = stripeError;
    }

    @Override
    public String toString() {
        return "PaymentIntentDTO{" +
                "paymentIntent=" + paymentIntent +
                ", stripeError=" + stripeError +
                '}';
    }

}
