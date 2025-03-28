package com.user_service.models;

import java.util.List;

public class User {
    private String id;
    private String email;
    private String displayName;
    //Addresses
    List<Address> addresses;


    public User(String id, String displayName) {
        this.id = id;
        this.displayName = displayName;
    }

    public User(String id, String displayName, String email) {
        this.id = id;
        this.displayName = displayName;
        this.email = email;
    }


    public User() {
        // Default constructor required for calls to DataSnapshot.getValue(User.class)
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public void  setDisplayName(String displayName) {
        this.displayName = displayName;
    }

}