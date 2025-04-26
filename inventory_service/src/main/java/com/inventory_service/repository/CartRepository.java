package com.inventory_service.repository;


import com.inventory_service.model.Cart;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {

    Optional<Cart> findById(Integer id);
    Optional<Cart> findByUserId(String userId);
    // Find all Cart by CartItems that contain the given Item ID
    Page<Cart> findAllByCartItems_ItemId(String itemId, Pageable pageable);
}
