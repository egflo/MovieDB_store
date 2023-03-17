package com.order_service.repository;

import com.order_service.model.Address;
import com.order_service.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("OrderRepository")
public interface OrderRepository extends JpaRepository<Order, Integer> {
    Optional<Order> findById(Integer id);

    Page<Order> findAll(Pageable page);

    Page<Order> findByUserId(String userId, Pageable page);

    Page<Order> findById(Long orderId, PageRequest pageRequest);

    Page<Order> findByUserIdAndId(String userId, Long orderId, PageRequest pageRequest);


    @Query("SELECT o FROM Order o WHERE o.address.postcode = ?1")
    Page<Order> findByPostcode(String postcode, PageRequest pageRequest);
}