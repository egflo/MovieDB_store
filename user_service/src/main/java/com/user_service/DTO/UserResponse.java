package com.user_service.DTO;

import com.user_service.models.Address;
import lombok.Getter;
import lombok.Setter;

import java.util.List;


@Setter
@Getter
public class UserResponse {
    private String id;
    private String customerId;
    private String email;
    private String displayName;
    private List<Address> addresses;

    // constructors, getters and setters
    public UserResponse(String id, String customerId, String email, List<Address> addresses) {
        this.id = id;
        this.customerId = customerId;
        this.email = email;
        this.addresses = addresses;
    }

    public UserResponse(String id, String customerId, String email, String displayName) {
        this.id = id;
        this.customerId = customerId;
        this.email = email;
        this.displayName = displayName;
    }

    public UserResponse(String id, String customerId) {
        this.id = id;
        this.customerId = customerId;
    }

    public UserResponse() {
    }
}