package com.order_service.model;

import jakarta.persistence.*;


import java.util.Date;
import java.util.List;

@Entity
@Table(name = "order")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String userId;

    @JoinColumn(name = "id")
    @OneToOne(fetch = FetchType.LAZY)
    private Address address;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;

    private String status;

    private Double subTotal;

    private Double tax;

    private Double total;

    private Date created;

    private Date updated;


    public Order() {
    }

    public Order(String userId,
                 Address address, String status, Double subTotal, Double tax, Double total, Date createdAt, Date updatedAt) {
        this.userId = userId;
        this.address = address;
        this.status = status;
        this.subTotal = subTotal;
        this.tax = tax;
        this.total = total;
        this.created = createdAt;
        this.updated = updatedAt;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(Double subTotal) {
        this.subTotal = subTotal;
    }

    public Double getTax() {
        return tax;
    }

    public void setTax(Double tax) {
        this.tax = tax;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
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

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

}
