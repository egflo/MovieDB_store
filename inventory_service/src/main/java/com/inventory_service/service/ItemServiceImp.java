package com.inventory_service.service;

import com.inventory_service.DTO.ItemDTO;
import com.inventory_service.model.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;


public interface ItemServiceImp {

    public Page<Item> getAll(Pageable pageable);

    public Item addItem(ItemDTO request);

    public void removeItem(String id);

    public Item updateItem(ItemDTO request);

    public Item getItemById(String itemId);

    public Page<Item> getItemsBySKU(String sku, Pageable pageable);

    public void delete(String id);



}