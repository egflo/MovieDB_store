package com.inventory_service.service;


import com.inventory_service.DTO.ItemDTO;
import com.inventory_service.model.Item;
import com.inventory_service.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Optional;

@Service
@Transactional
public class ItemService implements ItemServiceImp {

    @Autowired
    private ItemRepository itemRepository;



    public boolean inventoryUpdate(String id, int quantity) {
        Optional<Item> item = itemRepository.findById(id);
        if(item.isPresent()){
            if(item.get().getQuantity() >= quantity){
                item.get().setQuantity(item.get().getQuantity() - quantity);
                itemRepository.save(item.get());
                return true;
            }
        }
        return false;
    }

    @Override
    public ResponseEntity<?> getAll(Pageable pagable) {

        Page<Item> items = itemRepository.findAll(pagable);
        return ResponseEntity.ok(items);
    }

    @Override
    public ResponseEntity<?> addItem(ItemDTO request) {
        Item item = new Item();
        item.setSKU(request.getSKU());
        item.setId(request.getId());
        item.setQuantity(request.getQuantity());
        item.setPrice(request.getPrice());
        item.setCreated(new Date());
        item.setUpdated(new Date());

        Item save = itemRepository.save(item);
        return ResponseEntity.ok(save);
    }

    @Override
    public ResponseEntity<?> removeItem(ItemDTO request) {

        Optional<Item> item = itemRepository.findById(request.getId());
        if(item.isPresent()){
            itemRepository.delete(item.get());
            return ResponseEntity.ok("Item removed from cart");
        }
        return ResponseEntity.ok("Item not found");
    }

    @Override
    public ResponseEntity<?> updateItem(ItemDTO request) {

        Optional<Item> item = itemRepository.findById(request.getId());
        if(item.isPresent()){
            item.get().setQuantity(request.getQuantity());
            item.get().setPrice(request.getPrice());
            item.get().setUpdated(new Date());
            Item save = itemRepository.save(item.get());
            return ResponseEntity.ok(save);
        }
        return ResponseEntity.ok("Item not found");
    }

    @Override
    public ResponseEntity<?> getItem(ItemDTO request) {
        Optional<Item> item = itemRepository.findById(request.getId());
        if(item.isPresent()){
            return ResponseEntity.ok(item.get());
        }
        return ResponseEntity.ok("Item not found");
    }

    @Override
    public ResponseEntity<?> getItemById(String id) {
        Optional<Item> item = itemRepository.findById(id);
        if(item.isPresent()){
            return ResponseEntity.ok(item.get());
        }
        return ResponseEntity.ok("Item not found");
    }

    @Override
    public ResponseEntity<?> getItemsBySKU(String sku, Pageable pageable) {
        Page<Item> items = itemRepository.findAllBySKU(sku, pageable);
        return ResponseEntity.ok(items);
    }

    @Override
    public ResponseEntity<?> delete(String id) {

        Optional<Item> item = itemRepository.findItemById(id);
        if(item.isPresent()){
            itemRepository.delete(item.get());
            return ResponseEntity.ok("Item deleted");
        }
        return ResponseEntity.ok("Item not found");
    }
}
