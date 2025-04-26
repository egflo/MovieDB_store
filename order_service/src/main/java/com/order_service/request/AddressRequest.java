package com.order_service.request;


import lombok.Getter;
import lombok.Setter;

@Setter
public class AddressRequest {
    private String id;

    private String userId;

    private String firstName;

    private String lastName;

    private String street;

    private String city;

    private String state;

    private String postcode;

    private String country;

    private boolean isDefault;

    public AddressRequest() {
    }

    public AddressRequest(String id, String firstName, String
            lastName, String street, String city, String state,
                          String postcode, String country, boolean isDefault) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.street = street;
        this.city = city;
        this.state = state;
        this.postcode = postcode;
        this.country = country;
        this.isDefault = isDefault;
    }

    public String getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getStreet() {
        return street;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getPostcode() {
        return postcode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public boolean getIsDefault() {
        return isDefault;
    }

    @Override
    public String toString() {
        return "AddressRequest{" +
                "firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", street='" + street + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", postcode='" + postcode + '\'' +
                '}';
    }

    public String getUserId() {
        return userId;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }
}
