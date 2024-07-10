package com.order_service.service;

import com.order_service.dto.AddressDTO;
import com.order_service.model.Shipping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;

public interface ShippingServiceImp {
    public Shipping getAddress(Integer id);
    public Shipping createAddress(AddressDTO addressDTO);

    public  Shipping updateAddress(AddressDTO addressDTO);

    public void deleteAddress(Integer id);

    public Page<Shipping> getAllAddresses(PageRequest pageRequest);
    public Page<Shipping> getAddressesByFirstName(String firstName, PageRequest pageRequest);
    public Page<Shipping> getAddressesByLastName(String lastname, PageRequest pageRequest);
    public Page<Shipping> getAddressesByFirstNameAndLastName(String firstName, String lastName, PageRequest pageRequest);

    public Page<Shipping> getAddressesByPostcode(String postcode, PageRequest pageRequest);



}
