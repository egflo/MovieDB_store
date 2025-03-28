package com.user_service.models;

import java.util.List;

public class FirebaseUser {
    private String id;
    private String customerId;
    private String email;
    private String password;
    private String displayName;
    //Addresses
    List<Address> addresses;


    public FirebaseUser(String id, String customerId) {
        this.id = id;
        this.customerId = customerId;
    }

    public FirebaseUser(String id, String customerId, String email) {
        this.id = id;
        this.customerId = customerId;
        this.email = email;
    }

    public FirebaseUser(String id, String customerId, String email, String password, String displayName) {
        this.id = id;
        this.customerId = customerId;
        this.email = email;
        this.password = password;
        this.displayName = displayName;
    }


    public FirebaseUser() {
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void  setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public List<Address> getAddresses() {
        return addresses;
    }

    public void setAddresses(List<Address> addresses) {
        this.addresses = addresses;
    }

    public void addAddress(Address address) {
        this.addresses.add(address);
    }

    public void removeAddress(Address address) {
        this.addresses.remove(address);
    }
}