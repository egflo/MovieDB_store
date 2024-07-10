package com.inventory_service.DTO;

import java.util.Date;

public class ItemDTO {
    String id;
    String SKU;
    Integer price;
    Integer quantity;
    String status;
    Date updated;
    String currency;


    public ItemDTO() {
    }

    public ItemDTO(String id, String SKU, Integer price, Integer quantity, String status, Date updated, String currency) {
        this.id = id;
        this.SKU = SKU;
        this.price = price;
        this.quantity = quantity;
        this.status = status;
        this.updated = updated;
        this.currency = currency;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getUpdate() {
        return updated.toString();
    }

    public void setUpdate(Date created) {
        this.updated = created;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    @Override
    public String toString() {
        return "ItemDTO{" +
                "id='" + id + '\'' +
                ", SKU='" + SKU + '\'' +
                ", price=" + price +
                ", quantity=" + quantity +
                ", status='" + status + '\'' +
                ", created='" + updated + '\'' +
                '}';
    }

    public Date getUpdated() {
        return updated;
    }

    public void setUpdated(Date updated) {
        this.updated = updated;
    }
}
