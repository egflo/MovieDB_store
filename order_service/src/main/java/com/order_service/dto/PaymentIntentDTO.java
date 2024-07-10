package com.order_service.dto;


import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeError;

public class PaymentIntentDTO {
    private PaymentIntent paymentIntent;

    public PaymentIntentDTO() {
    }

    public PaymentIntentDTO(PaymentIntent paymentIntent) {
        this.paymentIntent = paymentIntent;
    }

    public PaymentIntent getPaymentIntent() {
        return paymentIntent;
    }

    public void setPaymentIntent(PaymentIntent paymentIntent) {
        this.paymentIntent = paymentIntent;
    }


    @Override
    public String toString() {
        return "PaymentIntentDTO{" +
                "paymentIntent=" + paymentIntent +
                 +
                '}';
    }

}
