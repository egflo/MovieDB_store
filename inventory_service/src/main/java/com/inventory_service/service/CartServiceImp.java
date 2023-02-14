package com.inventory_service.service;

import com.inventory_service.DTO.CartDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

public interface CartServiceImp {
    public ResponseEntity<?> getAll(Pageable pagable);


    public ResponseEntity<?> findAllByItemId(String itemId, Pageable pagable);

    public ResponseEntity<?> addItem(CartDTO request);

    public ResponseEntity<?> removeItem(CartDTO request);

    public ResponseEntity<?> updateItem(CartDTO request);

    public ResponseEntity<?> clearCart(CartDTO request);

    public ResponseEntity<?> getCart(CartDTO request);

    public ResponseEntity<?> getCartItems(CartDTO request);

    public ResponseEntity<?> getCartItemsQty(CartDTO request);

    public ResponseEntity<?> getCartByUserId(String userId);
}
