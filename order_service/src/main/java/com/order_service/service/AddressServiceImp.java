package com.order_service.service;

import com.order_service.dto.AddressDTO;
import com.order_service.model.Address;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;

public interface AddressServiceImp {
    public Address getAddress(Integer id);
    public Address createAddress(AddressDTO addressDTO);

    public  Address updateAddress(AddressDTO addressDTO);

    public void deleteAddress(Integer id);

    public Page<Address> getAllAddresses(PageRequest pageRequest);
    public Page<Address> getAddressesByFirstName(String firstName, PageRequest pageRequest);
    public Page<Address> getAddressesByLastName(String lastname, PageRequest pageRequest);
    public Page<Address> getAddressesByFirstNameAndLastName(String firstName, String lastName, PageRequest pageRequest);

    public Page<Address> getAddressesByPostcode(String postcode, PageRequest pageRequest);



}
