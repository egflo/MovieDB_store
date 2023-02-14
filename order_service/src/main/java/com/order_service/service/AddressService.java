package com.order_service.service;


import com.order_service.dto.AddressDTO;
import com.order_service.model.Address;
import com.order_service.repository.AddressRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AddressService {

    private final AddressRepository addressRepository;


    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public ResponseEntity<?> getAddress(Integer id) {
        return addressRepository.findById(id)
                .map(address -> new ResponseEntity<>(address, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }


    public ResponseEntity<?> createAddress(AddressDTO addressDTO) {

        Address address = new Address();
        address.setFirstName(addressDTO.getFirstName());
        address.setLastName(addressDTO.getLastName());
        address.setStreet(addressDTO.getStreet());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setPostcode(addressDTO.getPostcode());
        address.setOrderId(addressDTO.getOrderId());

        Address save = addressRepository.save(address);

        return new ResponseEntity<>(save, HttpStatus.CREATED);

    }

    public ResponseEntity<?> getAllAddresses(PageRequest pageRequest) {

        return ResponseEntity.ok(addressRepository.findAll(pageRequest));
    }

    public ResponseEntity<?> getAddressesByFirstName(String firstName, PageRequest pageRequest) {
        return ResponseEntity.ok(
         addressRepository.findAllByFirstName(firstName, pageRequest));
    }

    public ResponseEntity<?> getAddressesByLastName(String lastname, PageRequest pageRequest) {
        return ResponseEntity.ok(
                addressRepository.findAllByLastName(lastname, pageRequest));
    }

    public ResponseEntity<?> getAddressesByCity(String city, PageRequest pageRequest) {
        return ResponseEntity.ok(
                addressRepository.findByCity(city, pageRequest));
    }

    public ResponseEntity<?> getAddressesByState(String state, PageRequest pageRequest) {
        return ResponseEntity.ok(
                addressRepository.findByState(state, pageRequest));
    }

    public ResponseEntity<?> getAddressesByPostcode(String postcode, PageRequest pageRequest) {
        return ResponseEntity.ok(
                addressRepository.findByPostcode(postcode, pageRequest));
    }

}
