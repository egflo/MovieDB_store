package com.order_service.dto;

import org.proto.grpc.CartItem;
import org.proto.grpc.CartResponse;

import java.util.Date;
import java.util.List;

public class CheckoutResponse {
    String userId;

    Date createdAt;

    Double total;

    Double tax;

    Double shipping;

    Double subTotal;

    String clientSecret;

    String paymentIntentId;

    List<CartItemDTO> items;

    public CheckoutResponse() {
    }

    public CheckoutResponse(String userId, Date createdAt, Double total,
                            Double tax, Double shipping, Double subTotal,
                            String clientSecret, List<CartItemDTO> items,
                            String paymentIntentId) {
        this.userId = userId;
        this.createdAt = createdAt;
        this.total = total;
        this.tax = tax;
        this.shipping = shipping;
        this.subTotal = subTotal;
        this.clientSecret = clientSecret;
        this.items = items;
        this.paymentIntentId = paymentIntentId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public Double getTax() {
        return tax;
    }

    public void setTax(Double tax) {
        this.tax = tax;
    }

    public Double getShipping() {
        return shipping;
    }

    public void setShipping(Double shipping) {
        this.shipping = shipping;
    }

    public Double getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(Double subTotal) {
        this.subTotal = subTotal;
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

    public List<CartItemDTO> getItems() {
        return items;
    }

    public void setItems(List<CartItemDTO> items) {
        this.items = items;
    }

    @Override
    public String toString() {
        return "OrderResponse [clientSecret=" + clientSecret + ", createdAt=" + createdAt + ", items=" + items + ", shipping=" + shipping + ", subTotal=" + subTotal + ", tax=" + tax + ", total=" + total + ", userId=" + userId + "]";
    }

}
