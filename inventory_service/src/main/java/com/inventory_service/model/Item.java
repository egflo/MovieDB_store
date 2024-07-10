package com.inventory_service.model;


import jakarta.persistence.*;

import java.util.Date;


@Entity
@Table(name = "item")
public class Item {
    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "price")
    private Integer price;

    @Column(name ="currency")
    private String currency;

    @Column(name = "SKU")
    private String SKU;

    private int quantity;

    @Enumerated(EnumType.STRING)
    private Status status;

    private Date created;

    private Date updated;

    @ManyToOne
    @JoinColumn(name = "type")
    private Type type;

    public Item() {
    }

    public Item(String id, Integer price, String currency, String SKU, int quantity, Status status, Date created, Date updated, Type type) {
        this.id = id;
        this.price = price;
        this.currency = currency;
        this.SKU = SKU;
        this.quantity = quantity;
        this.status = status;
        this.created = created;
        this.updated = updated;
        this.type = type;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public String getSKU() {
        return SKU;
    }

    public void setSKU(String SKU) {
        this.SKU = SKU;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public Date getUpdated() {
        return updated;
    }

    public void setUpdated(Date updated) {
        this.updated = updated;
    }



    @Override
    public String toString() {
        return "Item{" +
                "id='" + id + '\'' +
                ", price=" + price +
                ", SKU='" + SKU + '\'' +
                ", quantity=" + quantity +
                ", status='" + status + '\'' +
                ", created=" + created +
                ", updated=" + updated +
                //", type=" + type +
                '}';
    }

}
