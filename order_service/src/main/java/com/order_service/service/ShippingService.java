package com.order_service.service;


import com.order_service.dto.AddressDTO;
import com.order_service.exception.AddressException;
import com.order_service.model.Shipping;
import com.order_service.repository.ShippingRepository;
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
public class ShippingService implements ShippingServiceImp {

    private final ShippingRepository addressRepository;


    public ShippingService(ShippingRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public Shipping getAddress(Integer id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new AddressException("Address not found for this id :: " + id));
    }

    public Shipping createAddress(AddressDTO addressDTO) {

        Shipping address = new Shipping();
        address.setFirstName(addressDTO.getFirstName());
        address.setLastName(addressDTO.getLastName());
        address.setStreet(addressDTO.getStreet());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setPostalCode(addressDTO.getPostcode());

        Shipping save = addressRepository.save(address);
        return save;

    }

    @Override
    public Shipping updateAddress(AddressDTO addressDTO) {
        Optional<Shipping> address = addressRepository.findById(1);
        if (address.isPresent()) {
            Shipping address1 = address.get();
            address1.setFirstName(addressDTO.getFirstName());
            address1.setLastName(addressDTO.getLastName());
            address1.setStreet(addressDTO.getStreet());
            address1.setCity(addressDTO.getCity());
            address1.setState(addressDTO.getState());
            address1.setPostalCode(addressDTO.getPostcode());
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

    public Page<Shipping> getAllAddresses(PageRequest pageRequest) {

        return addressRepository.findAll(pageRequest);
    }

    public Page<Shipping> getAddressesByFirstName(String firstName, PageRequest pageRequest) {

        return addressRepository.findAllByFirstName(firstName, pageRequest);
    }

    public Page<Shipping> getAddressesByLastName(String lastname, PageRequest pageRequest) {

            return addressRepository.findAllByLastName(lastname, pageRequest);
    }

    @Override
    public Page<Shipping> getAddressesByFirstNameAndLastName(String firstName, String lastName, PageRequest pageRequest) {
        return addressRepository.findAllByFirstNameAndLastName(firstName, lastName, pageRequest);
    }

    public Page<Shipping> getAddressesByPostcode(String postcode, PageRequest pageRequest) {

            return addressRepository.findByPostcode(postcode, pageRequest);
    }


}
