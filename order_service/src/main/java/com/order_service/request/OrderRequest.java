package com.order_service.request;

public class OrderRequest {
    private String userId;
    private AddressRequest address;

    public OrderRequest() {
    }

    public OrderRequest(String userId, AddressRequest address) {
        this.userId = userId;
        this.address = address;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public AddressRequest getAddress() {
        return address;
    }

    public void setAddress(AddressRequest address) {
        this.address = address;
    }
}
