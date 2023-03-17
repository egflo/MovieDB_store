package com.order_service.service;


import com.order_service.dto.AddressDTO;
import com.order_service.exception.AddressException;
import com.order_service.model.Address;
import com.order_service.repository.AddressRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AddressService implements AddressServiceImp {

    private final AddressRepository addressRepository;


    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public Address getAddress(Integer id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new AddressException("Address not found for this id :: " + id));
    }


    public Address createAddress(AddressDTO addressDTO) {

        Address address = new Address();
        address.setFirstName(addressDTO.getFirstName());
        address.setLastName(addressDTO.getLastName());
        address.setStreet(addressDTO.getStreet());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setPostcode(addressDTO.getPostcode());

        Address save = addressRepository.save(address);
        return save;

    }

    @Override
    public Address updateAddress(AddressDTO addressDTO) {
        Optional<Address> address = addressRepository.findById(addressDTO.getId());
        if (address.isPresent()) {
            Address address1 = address.get();
            address1.setFirstName(addressDTO.getFirstName());
            address1.setLastName(addressDTO.getLastName());
            address1.setStreet(addressDTO.getStreet());
            address1.setCity(addressDTO.getCity());
            address1.setState(addressDTO.getState());
            address1.setPostcode(addressDTO.getPostcode());
            addressRepository.save(address1);
            return address1;
        } else {
            throw new AddressException("Address not found for this id :: " + addressDTO.getId());
        }
    }

    @Override
    public void deleteAddress(Integer id) {
        addressRepository.deleteById(id);
    }

    public Page<Address> getAllAddresses(PageRequest pageRequest) {

        return addressRepository.findAll(pageRequest);
    }

    public Page<Address> getAddressesByFirstName(String firstName, PageRequest pageRequest) {

        return addressRepository.findAllByFirstName(firstName, pageRequest);
    }

    public Page<Address> getAddressesByLastName(String lastname, PageRequest pageRequest) {

            return addressRepository.findAllByLastName(lastname, pageRequest);
    }

    @Override
    public Page<Address> getAddressesByFirstNameAndLastName(String firstName, String lastName, PageRequest pageRequest) {
        return addressRepository.findAllByFirstNameAndLastName(firstName, lastName, pageRequest);
    }

    public Page<Address> getAddressesByPostcode(String postcode, PageRequest pageRequest) {

            return addressRepository.findByPostcode(postcode, pageRequest);
    }


}
