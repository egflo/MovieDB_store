package com.order_service.dto;

public class RefundDTO {

    String id;
    Long created;
    String currency;
    String paymentId;
    Long amount;
    String status;

    public RefundDTO() {
    }

    public RefundDTO(String id, Long created, String currency, String paymentId, Long amount, String status) {
        this.id = id;
        this.created = created;
        this.currency = currency;
        this.paymentId = paymentId;
        this.amount = amount;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getCreated() {
        return created;
    }

    public void setCreated(Long created) {
        this.created = created;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "RefundDTO{" +
                "id='" + id + '\'' +
                ", created=" + created +
                ", currency='" + currency + '\'' +
                ", paymentId='" + paymentId + '\'' +
                ", amount=" + amount +
                ", status='" + status + '\'' +
                '}';
    }
}
