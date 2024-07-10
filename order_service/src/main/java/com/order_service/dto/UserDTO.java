package com.order_service.dto;

import java.util.List;

public class UserDTO {
    private String id;
    private String customerId;
    private String email;
    private List<AddressDTO> addresses;

    // constructors, getters and setters
    public UserDTO(String id, String customerId, String email, List<AddressDTO> addresses) {
        this.id = id;
        this.customerId = customerId;
        this.email = email;
        this.addresses = addresses;
    }

    public UserDTO(String id, String customerId, String email) {
        this.id = id;
        this.customerId = customerId;
        this.email = email;
    }

    public UserDTO(String id, String customerId) {
        this.id = id;
        this.customerId = customerId;
    }

    public UserDTO() {
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

    public List<AddressDTO> getAddresses() {
        return addresses;
    }

    public void setAddresses(List<AddressDTO> addresses) {
        this.addresses = addresses;
    }
}