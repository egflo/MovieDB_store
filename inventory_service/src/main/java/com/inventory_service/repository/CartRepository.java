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


    List<Cart> findAllByUserId(String userId);

    Page<Cart> findAllByItemId(String itemId, Pageable pageable);

    Page<Cart> findAllByUserId(Integer userId, Pageable pageable);

    Optional<Cart> findCartById(Integer id);

    //Delete all by user id
    void deleteAllByUserId(String userId);


    Optional<Cart> findByItemIdAndUserId(String itemId, String userId);
}
