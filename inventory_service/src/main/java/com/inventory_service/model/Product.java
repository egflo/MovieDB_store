package com.inventory_service.model;


import jakarta.persistence.*;

import java.util.Date;


@Entity
@Table(name = "product")
public class Product {
    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "price")
    private Integer price;

    @Column(name ="currency")
    private String currency;

    @Column(name = "SKU")
    private String SKU;

    @Column(name = "quantity")
    private int quantity;

    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne
    @JoinColumn(name = "type")
    private Category category;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created")
    private Date created;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated")
    private Date updated;

    public Product() {
        this.created = new Date();
        this.updated = new Date();
        this.status = Status.IN_STOCK;
    }

    public Product(String id, Integer price, String currency, String SKU, int quantity, Status status, Date created, Date updated, Category category) {
        this.id = id;
        this.price = price;
        this.currency = currency;
        this.SKU = SKU;
        this.quantity = quantity;
        this.status = status;
        this.created = created;
        this.updated = updated;
        this.category = category;
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

    public Category getType() {
        return category;
    }

    public void setType(Category category) {
        this.category = category;
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
                ", type=" + category +
                '}';
    }

}
