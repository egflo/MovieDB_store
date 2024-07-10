package com.order_service.dto;

public class PaymentSheetDTO {
    private String publishableKey;
    private String customer;
    private String paymentIntent;
    private String ephemeralKey;
    private String paymentIntentId;


    public PaymentSheetDTO() {
    }

    public PaymentSheetDTO(String publishableKey, String customer, String paymentIntent,
                           String ephemeralKey, String paymentIntentId) {
        this.publishableKey = publishableKey;
        this.customer = customer;
        this.paymentIntent = paymentIntent;
        this.ephemeralKey = ephemeralKey;
        this.paymentIntentId = paymentIntentId;
    }

    public String getPublishableKey() {
        return publishableKey;
    }

    public void setPublishableKey(String publishableKey) {
        this.publishableKey = publishableKey;
    }

    public String getCustomer() {
        return customer;
    }

    public void setCustomer(String customer) {
        this.customer = customer;
    }

    public String getPaymentIntent() {
        return paymentIntent;
    }

    public void setPaymentIntent(String paymentIntent) {
        this.paymentIntent = paymentIntent;
    }

    public String getEphemeralKey() {
        return ephemeralKey;
    }

    public void setEphemeralKey(String ephemeralKey) {
        this.ephemeralKey = ephemeralKey;
    }

    public String getPaymentIntentId() {
        return paymentIntentId;
    }


    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }

    @Override
    public String toString() {
        return "PaymentSheetDTO{" +
                "publishableKey='" + publishableKey + '\'' +
                ", customer='" + customer + '\'' +
                ", paymentIntent='" + paymentIntent + '\'' +
                ", ephemeralKey='" + ephemeralKey + '\'' +
                ", paymentIntentId='" + paymentIntentId + '\'' +
                '}';
    }

}
