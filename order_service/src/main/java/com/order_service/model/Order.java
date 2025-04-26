package com.order_service.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    private String paymentType;

    private String currency;

    private String network;


    @JsonIgnore
    private String paymentId;

    private Status status;

    private Long subTotal;

    private Long tax;

    private Long total;

    private Date created;

    private Date updated;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "order")
    @PrimaryKeyJoinColumn
    private Shipping shipping;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @PrimaryKeyJoinColumn
    private Set<OrderItem> items;

    public Order() {
        this.items = new HashSet<>();
    }

    public Order(String userId, Status status, Long subTotal, Long tax, Long total, Date createdAt, Date updatedAt) {
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

    public Long getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(Long subTotal) {
        this.subTotal = subTotal;
    }

    public Long getTax() {
        return tax;
    }

    public void setTax(Long tax) {
        this.tax = tax;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
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

    public Shipping getShipping() {
        return shipping;
    }

    public void setShipping(Shipping shipping) {
        this.shipping = shipping;
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

    public void addShipping(Shipping address) {
        this.shipping = address;
        address.setOrder(this);
    }

    public void removeShipping(Shipping address) {
        this.shipping = null;
        address.setOrder(null);
    }

    public String getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getNetwork() {
        return network;
    }

    public void setNetwork(String network) {
        this.network = network;
    }

    public String toString() {
        return "Order [id=" + id + ", userId=" + userId + ", status=" + status + ", subTotal=" + subTotal + ", tax=" + tax + ", total=" + total + ", created=" + created + ", updated=" + updated + ", address=" + shipping + ", items=" + items + "]";
    }


}
