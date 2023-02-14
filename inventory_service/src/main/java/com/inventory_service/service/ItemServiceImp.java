package com.inventory_service.service;

import com.inventory_service.DTO.ItemDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;


public interface ItemServiceImp {

    public ResponseEntity<?> getAll(Pageable pagable);

    public ResponseEntity<?> addItem(ItemDTO request);

    public ResponseEntity<?> removeItem(ItemDTO request);

    public ResponseEntity<?> updateItem(ItemDTO request);

    public ResponseEntity<?> getItem(ItemDTO request);

    public ResponseEntity<?> getItemById(String itemId);

    public ResponseEntity<?> getItemsBySKU(String sku, Pageable pageable);

    public ResponseEntity<?> delete(String id);



}