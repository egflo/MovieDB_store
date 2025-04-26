package com.order_service.dto;

import com.order_service.model.User;

import java.util.List;

public class UserDTO {
    private String id;
    private String customerId;
    private String email;
    private String displayName;
    private String photoUrl;
    private List<AddressDTO> addresses;

    public UserDTO(User user) {
        this.id = user.getId();
        this.customerId = user.getCustomerId();
        this.email = user.getEmail();
        this.displayName = user.getDisplayName();
        this.photoUrl = user.getPhotoUrl();

        // Convert UserAddress to AddressDTO
        List<AddressDTO> addressDTOs = user.getAddresses().stream().map(AddressDTO::new).toList();
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

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public List<AddressDTO> getAddresses() {
        return addresses;
    }

    public void setAddresses(List<AddressDTO> addresses) {
        this.addresses = addresses;
    }
}