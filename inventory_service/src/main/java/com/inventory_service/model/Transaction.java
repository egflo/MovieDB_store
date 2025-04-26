package com.inventory_service.model;

import jakarta.persistence.*;

import java.util.Date;

@Entity
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "product_id")
    private String productId;

    @Column(name = "quantity")
    private int quantity;

    @Column(name = "type")
    private Type type;

    @Column(name = "reason")
    private String reason;

    @Column(name = "created")
    private Date created;

    @Column(name = "updated")
    private Date updated;

    public Transaction() {
        this.created = new Date();
    }

    public Transaction(String productId, int quantity, Type type, String reason) {
        this.productId = productId;
        this.quantity = quantity;
        this.type = type;
        this.reason = reason;
        this.created = new Date();
        this.updated = new Date();
    }

    public Transaction(String productId, int quantity, Type type, String reason, Date created, Date updated) {
        this.productId = productId;
        this.quantity = quantity;
        this.type = type;
        this.reason = reason;
        this.created = created;
        this.updated = updated;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
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

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
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


}
