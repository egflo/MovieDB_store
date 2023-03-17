package com.inventory_service.service;


import com.inventory_service.DTO.ItemDTO;
import com.inventory_service.exception.IdNotFoundException;
import com.inventory_service.model.Item;
import com.inventory_service.model.Status;
import com.inventory_service.repository.ItemRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
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
        Optional<Item> present = itemRepository.findById(id);

        if(present.isPresent()){
            Item item = present.get();
            if(item.getStatus().equals(Status.OUT_OF_STOCK)){
                return false;
            }
            if(item.getQuantity() >= quantity){
                item.setQuantity(item.getQuantity() - quantity);
                itemRepository.save(item);

                //TODO: send message to kafka
                //Update inventory status
                if(item.getQuantity() == 0){
                    item.setStatus(Status.OUT_OF_STOCK);
                    itemRepository.save(item);
                }

                if(item.getQuantity() < 10){
                    item.setStatus(Status.LIMITED);
                    itemRepository.save(item);
                }
                return true;
            }
        }

        return false;
    }

    @Override
    @RateLimiter(name = "RateLimiterService")
    //@TimeLimiter(name = "TimeLimiterService")
    public Page<Item> getAll(Pageable pagable) {
        Page<Item> items = itemRepository.findAll(pagable);
        return items;
    }

    @Override
    public Item addItem(ItemDTO request) {
        Item item = new Item();
        item.setSKU(request.getSKU());
        item.setId(request.getId());
        item.setQuantity(request.getQuantity());
        item.setPrice(request.getPrice());
        item.setCreated(new Date());
        item.setUpdated(new Date());

        Item save = itemRepository.save(item);
        return save;
    }

    @Override
    public void removeItem(String id) {

        Optional<Item> item = itemRepository.findById(id);
        if(item.isPresent()){
            itemRepository.delete(item.get());
        }

        throw new IdNotFoundException("Item not found with id: " + id);
    }

    @Override
    public Item updateItem(ItemDTO request) {

        Optional<Item> item = itemRepository.findById(request.getId());
        if(item.isPresent()){
            item.get().setQuantity(request.getQuantity());
            item.get().setPrice(request.getPrice());
            item.get().setUpdated(new Date());
            Item save = itemRepository.save(item.get());
            return save;
        }

        throw new IdNotFoundException("Item not found with id: " + request.getId());
    }


    @Override
    //@CircuitBreaker(name = "CircuitBreakerService")
    @RateLimiter(name = "RateLimiterService")
    public Item getItemById(String id) {
        Optional<Item> item = itemRepository.findById(id);
        if(item.isPresent()){
            return item.get();
        }

        throw new IdNotFoundException("Item not found with id: " + id);
    }

    @Override
    public Page<Item> getItemsBySKU(String sku, Pageable pageable) {
        Page<Item> items = itemRepository.findAllBySKU(sku, pageable);
        return items;
    }

    @Override
    public void delete(String id) {

        Optional<Item> item = itemRepository.findItemById(id);
        if(item.isPresent()){
            itemRepository.delete(item.get());
        }
        else {
            throw new IdNotFoundException("Item not found with id: " + id);
        }
    }
}
