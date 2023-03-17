package com.order_service.dto;

import org.proto.grpc.CartItem;

public class CartItemDTO {
    Long id;
    String itemId;
    String userId;
    Integer quantity;
    Double price;

    String name;
    String description;
    String image;
    String sku;

    public CartItemDTO(CartItem cartItem) {
        this.id = cartItem.getId();
        this.itemId = cartItem.getItemId();
        this.userId = cartItem.getUserId();
        this.quantity = cartItem.getQuantity();
        this.price = cartItem.getPrice();
        this.name = cartItem.getName();
        this.description = cartItem.getDescription();
        this.image = cartItem.getImage();
        this.sku = cartItem.getSku();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }


}
