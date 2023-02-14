package com.inventory_service.DTO;

public class ItemDTO {
    String id;
    String SKU;
    Double price;
    Integer quantity;
    String status;
    String created;


    public ItemDTO() {
    }

    public ItemDTO(String id, String SKU, Double price, Integer quantity, String status, String created) {
        this.id = id;
        this.SKU = SKU;
        this.price = price;
        this.quantity = quantity;
        this.status = status;
        this.created = created;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSKU() {
        return SKU;
    }

    public void setSKU(String SKU) {
        this.SKU = SKU;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreated() {
        return created;
    }

    public void setCreated(String created) {
        this.created = created;
    }

    @Override
    public String toString() {
        return "ItemDTO{" +
                "id='" + id + '\'' +
                ", SKU='" + SKU + '\'' +
                ", price=" + price +
                ", quantity=" + quantity +
                ", status='" + status + '\'' +
                ", created='" + created + '\'' +
                '}';
    }
}
