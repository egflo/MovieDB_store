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

    private int quantity;

    private double price;

    private Date created;

    private Date updated;

    @ManyToOne
    @JoinColumn(name="order_id", nullable=false)
    private Order order;

    public OrderItem() {
    }

    public OrderItem(String itemId, int quantity, double price, Date createdAt, Date updatedAt) {
        this.itemId = itemId;
        this.quantity = quantity;
        this.price = price;
        this.created = createdAt;
        this.updated= updatedAt;
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
        this.created = created;
    }

    public Date getUpdated() {
        return updated;
    }

    public void setUpdated(Date updatedAt) {
        this.updated = updated;
    }

}
