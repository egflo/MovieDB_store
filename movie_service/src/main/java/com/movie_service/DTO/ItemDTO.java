package com.movie_service.DTO;


import org.proto.grpc.ItemResponse;

public class ItemDTO {
    String id;
    String sku;
    Double price;
    Integer quantity;

    public ItemDTO(String id, String sku, Double price, Integer quantity) {
        this.id = id;
        this.sku = sku;
        this.price = price;
        this.quantity = quantity;
    }

    public ItemDTO(ItemResponse itemResponse) {
        this.id = itemResponse.getId();
        this.sku = itemResponse.getSku();
        this.price = itemResponse.getPrice();
        this.quantity = itemResponse.getQuantity();
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

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
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
