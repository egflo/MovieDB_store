package com.user_service.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.google.firebase.auth.UserRecord;

import java.util.Date;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown=true)
public class User {
    private String id;
    private String customerId;
    private String email;
    private String displayName;
    private String photoUrl;
    private String providerId;
    private boolean isEmailVerified;
    private boolean isDisabled;
    private long created;
    private long lastSignIn;
    private String phoneNumber;

    //Addresses
    List<Address> addresses;

    public  User(UserRecord userRecord) {
        this.id = userRecord.getUid();
        this.email = userRecord.getEmail();
        this.displayName = userRecord.getDisplayName();
        this.photoUrl = userRecord.getPhotoUrl();
    }

    public User(String id) {
        this.id = id;
    }

    public User(String id, String customerId) {
        this.id = id;
        this.customerId = customerId;
    }

    public User(String id, String customerId, String email) {
        this.id = id;
        this.customerId = customerId;
        this.email = email;
    }

    public User(String id, String customerId, String email, String displayName) {
        this.id = id;
        this.customerId = customerId;
        this.email = email;
        this.displayName = displayName;
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

    public void  setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public boolean isEmailVerified() {
        return isEmailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        isEmailVerified = emailVerified;
    }

    public boolean isDisabled() {
        return isDisabled;
    }

    public void setDisabled(boolean disabled) {
        isDisabled = disabled;
    }

    public long getCreated() {
        return created;
    }

    public void setCreated(long created) {
        this.created = created;
    }

    public long getLastSignIn() {
        return lastSignIn;
    }

    public void setLastSignIn(long lastSignIn) {
        this.lastSignIn = lastSignIn;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void getEmailVerified(boolean emailVerified) {
        isEmailVerified = emailVerified;
    }

    public void getDisabled(boolean disabled) {
        isDisabled = disabled;
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