package com.order_service.model;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Setter
@Getter
public class User {
    private String id;
    private String customerId;
    private String email;
    private String displayName;
    private String photoUrl;
    private String providerId;
    private boolean isEmailVerified;
    private boolean isDisabled;
    private Date created;
    private Date lastSignIn;
    private String phoneNumber;

    public User(String id, String customerId) {
        this.id = id;
        this.customerId = customerId;
    }

    public User(String id, String customerId, String email) {
        this.id = id;
        this.customerId = customerId;
        this.email = email;
    }

    public User(String id, String customerId, String email, String displayName, String photoUrl) {
        this.id = id;
        this.customerId = customerId;
        this.email = email;
        this.displayName = displayName;
        this.photoUrl = photoUrl;
    }

    //Addresses
    List<Address> addresses;

    public User() {
        // Default constructor required for calls to DataSnapshot.getValue(User.class)
    }

    public void addAddress(Address address) {
        this.addresses.add(address);
    }

    public void removeAddress(Address address) {
        this.addresses.remove(address);
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", customerId='" + customerId + '\'' +
                ", email='" + email + '\'' +
                ", displayName='" + displayName + '\'' +
                ", photoUrl='" + photoUrl + '\'' +
                ", addresses=" + addresses +
                '}';
    }
}