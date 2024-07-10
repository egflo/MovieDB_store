package com.order_service.request;

import java.util.List;

public class OrderRequest {
    private String userId;

    private String paymentId;

    private ShippingRequest address;

    private Long shipping;

    private Long subTotal;

    private Long tax;

    private Long total;

    private List<OrderItemRequest> items;

    public OrderRequest() {
    }

    public OrderRequest(String userId, String paymentId, ShippingRequest address, Long subTotal,
                        Long tax, Long total, Long shipping, List<OrderItemRequest> items ) {
        this.userId = userId;
        this.paymentId = paymentId;
        this.address = address;
        this.subTotal = subTotal;
        this.tax = tax;
        this.total = total;
        this.items = items;
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

    public ShippingRequest getAddress() {
        return address;
    }

    public void setAddress(ShippingRequest shipping) {
        this.address = shipping;
    }

    public Long getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(Long subTotal) {
        this.subTotal = subTotal;
    }

    public Long getTax() {
        return tax;
    }

    public void setTax(Long tax) {
        this.tax = tax;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    public Long getShipping() {
        return shipping;
    }

    public void setShipping(Long shipping) {
        this.shipping = shipping;
    }

    @Override
    public String toString() {
        return "OrderRequest{" +
                "userId='" + userId + '\'' +
                ", paymentId='" + paymentId + '\'' +
                ", address=" + address +
                ", subTotal=" + subTotal +
                ", tax=" + tax +
                ", total=" + total +
                ", items=" + items +
                '}';
    }
}
