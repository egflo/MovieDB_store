package com.order_service.model;

import com.stripe.model.Address;

import java.util.List;

public class User {
    private String id;
    private String customerId;

    private String email;

    public User(String id, String customerId) {
        this.id = id;
        this.customerId = customerId;
    }

    public User(String id, String customerId, String email) {
        this.id = id;
        this.customerId = customerId;
        this.email = email;
    }

    //Addresses
    List<UserAddress> addresses;

    public User() {
        // Default constructor required for calls to DataSnapshot.getValue(User.class)
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<UserAddress> getAddresses() {
        return addresses;
    }

    public void setAddresses(List<UserAddress> addresses) {
        this.addresses = addresses;
    }

    public void addAddress(UserAddress address) {
        this.addresses.add(address);
    }

    public void removeAddress(UserAddress address) {
        this.addresses.remove(address);
    }
}