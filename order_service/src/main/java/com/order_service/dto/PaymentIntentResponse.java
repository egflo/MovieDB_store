package com.order_service.dto;

public class PaymentIntentResponse {
    private String clientSecret;
    private String paymentIntentId;

    public PaymentIntentResponse() {
    }

    public PaymentIntentResponse(String clientSecret, String paymentIntentId) {
        this.clientSecret = clientSecret;
        this.paymentIntentId = paymentIntentId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getPaymentIntentId() {
        return paymentIntentId;
    }

    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }

    @Override
    public String toString() {
        return "PaymentIntentResponse{" +
                "clientSecret='" + clientSecret + '\'' +
                ", paymentIntentId='" + paymentIntentId + '\'' +
                '}';
    }
}
