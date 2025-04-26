package com.inventory_service.service;

import com.inventory_service.DTO.ItemDTO;
import com.inventory_service.model.Product;
import com.inventory_service.model.Type;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface ItemServiceImp {

    public Product updateInventory(String itemId, int quantity, Type type);

    public Page<Product> getAll(Pageable pageable);

    public Product add(ItemDTO request);

    public Product update(ItemDTO request);

    public Product getItemById(String itemId);

    public Page<Product> getItemsBySKU(String sku, Pageable pageable);

    public void delete(String id);

}