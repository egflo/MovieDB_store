package com.order_service.repository;

import com.order_service.model.Shipping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("ShippingRepository")
public interface ShippingRepository extends JpaRepository<Shipping, Integer> {
    Optional<Shipping> findById(Long id);

    Page<Shipping> findAllByFirstName(String firstName, Pageable page);

    Page<Shipping> findAllByLastName(String lastName, Pageable page);

    Page<Shipping> findByStreetContaining(String address, Pageable page);

    Page<Shipping> findByState(String state, Pageable page);

    Page<Shipping> findByCity(String city, Pageable page);

    Page<Shipping> findByPostcode(String postcode, Pageable page);

    Page<Shipping> findAll(Pageable page);

    Boolean existsAddressById(Integer id);

    Page<Shipping> findAllByFirstNameAndLastName(String firstName, String lastName, PageRequest pageRequest);

}