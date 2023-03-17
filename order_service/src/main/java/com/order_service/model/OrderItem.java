package com.order_service.model;


import jakarta.persistence.*;
import java.util.Date;
@Entity
@Table(name = "order_item")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String itemId;

    private String description;

    private String photo;

    private String sku;

    private int quantity;

    private double price;

    private Date created;

    private Date updated;

    @ManyToOne
    @JoinColumn(name="order_id", nullable=false)
    private Order order;

    public OrderItem() {
    }

    public OrderItem(String itemId, int quantity, double price, Date createdAt, Date updatedAt, String description, String photo, String sku) {
        this.itemId = itemId;
        this.quantity = quantity;
        this.price = price;
        this.created = createdAt;
        this.updated = updatedAt;
        this.description = description;
        this.photo = photo;
        this.sku = sku;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getItemId() {
        return itemId;
    }


    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date createdAt) {
        this.created = createdAt;
    }

    public Date getUpdated() {
        return updated;
    }

    public void setUpdated(Date updatedAt) {
        this.updated = updatedAt;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }


    public void setOrder(Order order) {
        this.order = order;
    }
}
