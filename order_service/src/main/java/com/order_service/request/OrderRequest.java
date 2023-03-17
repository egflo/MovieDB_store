package com.order_service.request;

public class OrderRequest {
    private String userId;

    private String paymentId;

    private AddressRequest shipping;

    public OrderRequest() {
    }

    public OrderRequest(String userId, AddressRequest shipping) {
        this.userId = userId;
        this.shipping = shipping;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public AddressRequest getShipping() {
        return shipping;
    }

    public void setShipping(AddressRequest shipping) {
        this.shipping = shipping;
    }

    public String toString() {
        return "OrderRequest{" +
                "userId='" + userId + '\'' +
                ", shipping=" + shipping +
                '}';
    }
}
