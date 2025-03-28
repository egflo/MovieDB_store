package com.user_service.DTO;

import com.user_service.models.Address;
import java.util.List;

public class UserResponse {
    private String id;
    private String customerId;
    private String email;
    private List<Address> addresses;

    // constructors, getters and setters
    public UserResponse(String id, String customerId, String email, List<Address> addresses) {
        this.id = id;
        this.customerId = customerId;
        this.email = email;
        this.addresses = addresses;
    }

    public UserResponse(String id, String customerId, String email) {
        this.id = id;
        this.customerId = customerId;
        this.email = email;
    }

    public UserResponse(String id, String customerId) {
        this.id = id;
        this.customerId = customerId;
    }

    public UserResponse() {
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

    public List<Address> getAddresses() {
        return addresses;
    }

    public void setAddresses(List<Address> addresses) {
        this.addresses = addresses;
    }
}