package com.order_service.dto;


import com.order_service.model.Address;
import com.order_service.request.AddressRequest;
import lombok.Getter;
import lombok.Setter;
import org.proto.grpc.AddressResponse;

public class AddressDTO {
    private String id;
    private String firstName;
    private String lastName;
    private String street;
    private String city;
    private String state;
    private String postcode;
    @Getter
    @Setter
    private String country;

    @Getter
    @Setter
    private boolean isDefault;

    public AddressDTO() {
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

    public AddressDTO(Address address) {
        this.firstName = address.getFirstName();
        this.lastName = address.getLastName();
        this.street = address.getStreet();
        this.city = address.getCity();
        this.state = address.getState();
        this.postcode = address.getPostcode();
        this.country = address.getCountry();
        this.isDefault = address.getIsDefault();
    }

    public AddressDTO(AddressResponse addressResponse) {
        this.id = addressResponse.getId();
        this.firstName = addressResponse.getFirstName();
        this.lastName = addressResponse.getLastName();
        this.street = addressResponse.getAddressLine1();
        this.city = addressResponse.getCity();
        this.state = addressResponse.getState();
        this.postcode = addressResponse.getPostalCode();
        this.country = addressResponse.getCountry();
        this.isDefault = addressResponse.getIsDefault();
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

    public String getPostcode() {
        return postcode;
    }

    public void setPostcode(String zip) {
        this.postcode = zip;
    }

}