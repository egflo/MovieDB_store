package com.order_service.dto;


import com.order_service.model.UserAddress;
import com.order_service.request.AddressRequest;

public class AddressDTO {
    private String id;
    private String firstName;
    private String lastName;
    private String street;
    private String city;
    private String state;
    private String postcode;
    private String country;
    private boolean isDefault;


    public AddressDTO() {
    }

    public AddressDTO(UserAddress address) {
        this.firstName = address.getFirstName();
        this.lastName = address.getLastName();
        this.street = address.getStreet();
        this.city = address.getCity();
        this.state = address.getState();
        this.postcode = address.getPostcode();
        this.country = address.getCountry();
        this.isDefault = address.getIsDefault();
    }

    public AddressDTO(AddressRequest request) {
        this.id = request.getId();
        this.firstName = request.getFirstName();
        this.lastName = request.getLastName();
        this.street = request.getStreet();
        this.city = request.getCity();
        this.state = request.getState();
        this.postcode = request.getPostcode();
        this.country = request.getCountry();
        this.isDefault = request.getIsDefault();
    }

    public AddressDTO(String firstName, String lastName, String street, String city, String state,
                      String postcode, String country, boolean isDefault) {
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

    public void setId(String id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPostalCode() {
        return postcode;
    }

    public void setPostalCode(String zip) {
        this.postcode = zip;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public boolean getisDefault() {
        return isDefault;
    }

    public void setisDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }


}