package com.order_service.model;

import jakarta.persistence.*;


import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

//Please do not use order as a table name. It is a reserved keyword
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;

    private String paymentId;

    private Status status;

    private Double subTotal;

    private Double tax;

    private Double total;

    private Date created;

    private Date updated;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "order")
    @PrimaryKeyJoinColumn
    private Address address;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @PrimaryKeyJoinColumn
    private Set<OrderItem> items;


    public Order() {
        this.items = new HashSet<>();
    }

    public Order(String userId, Status status, Double subTotal, Double tax, Double total, Date createdAt, Date updatedAt) {
        this.userId = userId;
        this.status = status;
        this.subTotal = subTotal;
        this.tax = tax;
        this.total = total;
        this.created = createdAt;
        this.updated = updatedAt;
        this.items = new HashSet<>();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }


    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
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

    public Long getCreated() {
        return created.getTime();
    }

    public void setCreated(Date createdAt) {
        this.created = createdAt;
    }

    public Long getUpdated() {
        return updated.getTime();
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

    public Set<OrderItem> getItems() {
        return items;
    }

    public void setItems(Set<OrderItem> items) {
        this.items = items;
    }

    public void addItem(OrderItem item) {
        this.items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        this.items.remove(item);
        item.setOrder(null);
    }

    public void addAddress(Address address) {
        this.address = address;
        address.setOrder(this);
    }

    public void removeAddress(Address address) {
        this.address = null;
        address.setOrder(null);
    }

    public String toString() {
        return "Order [id=" + id + ", userId=" + userId + ", status=" + status + ", subTotal=" + subTotal + ", tax=" + tax + ", total=" + total + ", created=" + created + ", updated=" + updated + ", address=" + address + ", items=" + items + "]";
    }


}
