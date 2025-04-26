package com.order_service.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItem {
    private long id;
    private String name;
    private String description;
    private double price;
    private int quantity;

    public CartItem() {
    }

    public CartItem(long id, String name, String description, double price, int quantity) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.quantity = quantity;
    }

    public CartItem(org.proto.grpc.CartItem cartItem) {
        this.id = cartItem.getId();
        this.name = cartItem.getName();
        this.description = cartItem.getDescription();
        this.price = cartItem.getPrice();
        this.quantity = cartItem.getQuantity();
    }

}
