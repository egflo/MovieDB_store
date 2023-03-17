package com.inventory_service.service;

import com.inventory_service.DTO.CartDTO;
import com.inventory_service.model.Cart;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

public interface CartServiceImp {
    public Page<Cart> getAll(Pageable pageable);

    public Page<Cart> findAllByItemId(String itemId, Pageable pageable);

    public Cart add(CartDTO request);

    public void delete(Integer id);

    public Cart update(CartDTO request);

    public Optional<Cart> findById(Integer id);


    public List<Cart> findAllByUserId(String userId);
}
