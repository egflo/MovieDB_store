package com.order_service.request;


import java.io.Serial;
import java.io.Serializable;

public class PaymentRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private  String userId;
    private String paymentMethodType;
    private String description;
    private Double amount;
    private String currency;
    private String stripeEmail;
    private String stripeToken;

    public PaymentRequest() {
    }

    public PaymentRequest(String userId, String paymentMethodType, String description, Double amount, String currency, String stripeEmail, String stripeToken) {
        this.userId = userId;
        this.paymentMethodType = paymentMethodType;
        this.description = description;
        this.amount = amount;
        this.currency = currency;
        this.stripeEmail = stripeEmail;
        this.stripeToken = stripeToken;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStripeEmail() {
        return stripeEmail;
    }

    public void setStripeEmail(String stripeEmail) {
        this.stripeEmail = stripeEmail;
    }

    public String getStripeToken() {
        return stripeToken;
    }

    public void setStripeToken(String stripeToken) {
        this.stripeToken = stripeToken;
    }

    public String getPaymentMethodType() {
        return paymentMethodType;
    }

    public void setPaymentMethodType(String paymentMethodType) {
        this.paymentMethodType = paymentMethodType;
    }

    @Override
    public String toString() {
        return "ChargeRequest{" +
                "description='" + description + '\'' +
                ", amount=" + amount +
                ", currency=" + currency +
                ", stripeEmail='" + stripeEmail + '\'' +
                ", stripeToken='" + stripeToken + '\'' +
                '}';
    }
}
