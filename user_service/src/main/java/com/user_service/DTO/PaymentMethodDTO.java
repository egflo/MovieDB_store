package com.order_service.dto;

import com.stripe.model.PaymentMethod;


public class PaymentMethodDTO {
    private String id;
    private String object;
    private String type;
    private String brand;
    private Long created;
    private String customer;
    private boolean isDefault;
    private CardDTO card;

    public PaymentMethodDTO() {
    }

    public PaymentMethodDTO(String id, String object, String type, String brand, Long created, String customer, CardDTO card) {
        this.id = id;
        this.object = object;
        this.type = type;
        this.brand = brand;
        this.created = created;
        this.customer = customer;
        this.card = card;

        this.isDefault = false;
    }

    public PaymentMethodDTO(PaymentMethod paymentMethod) {
        this.id = paymentMethod.getId();
        this.object = paymentMethod.getObject();
        this.type = paymentMethod.getType();
        this.brand = paymentMethod.getCard().getBrand();
        this.created = paymentMethod.getCreated();
        this.customer = paymentMethod.getCustomer();
        this.card = new CardDTO(paymentMethod.getCard());

        this.isDefault = false;

    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getObject() {
        return object;
    }

    public void setObject(String object) {
        this.object = object;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }


    public Long getCreated() {
        return created;
    }

    public void setCreated(Long created) {
        this.created = created;
    }

    public String getCustomer() {
        return customer;
    }

    public void setCustomer(String customer) {
        this.customer = customer;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public CardDTO getCard() {
        return card;
    }

    public void setCard(CardDTO card) {
        this.card = card;
    }

    public boolean getIsDefault() {
        return this.isDefault;
    }

    public void setDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }

}
