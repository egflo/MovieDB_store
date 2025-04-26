package com.user_service.models;

import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

public class UserMeta {
    @Field("id")
    private String id;
    private String email;
    private String displayName;

    public UserMeta(User user) {
        this.id = user.getId();
        this.displayName = user.getDisplayName();
        this.email = user.getEmail();
    }
    public UserMeta(String id, String displayName) {
        this.id = id;
        this.displayName = displayName;
    }

    public UserMeta(String id, String displayName, String email) {
        this.id = id;
        this.displayName = displayName;
        this.email = email;
    }

    public UserMeta() {
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