package com.movie_service.DTO;


import org.proto.grpc.ItemResponse;

public class ItemDTO {
    String id;
    String sku;
    Integer price;
    Integer quantity;
    String currency;

    public ItemDTO(ItemResponse itemResponse) {
        this.id = itemResponse.getId();
        this.sku = itemResponse.getSku();
        this.price = itemResponse.getPrice();
        this.quantity = itemResponse.getQuantity();
        this.currency = itemResponse.getCurrency();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getCurrency() {
        return currency;
    }

    @Override
    public String toString() {
        return "InventoryDTO{" +
                "id='" + id + '\'' +
                ", sku='" + sku + '\'' +
                ", price=" + price +
                ", quantity=" + quantity +
                '}';
    }
}
