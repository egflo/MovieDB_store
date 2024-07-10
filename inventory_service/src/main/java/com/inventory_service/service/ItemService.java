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

            //Update inventory
            //Check if quantity is available
            //If available, update inventory
            //If not available, return false
            //If quantity is 0, update status to OUT_OF_STOCK
            //If quantity is less than 10, update status to LIMITED
            //Save item

            //if quuantity is greater than or equal to the requested quantity

            if(item.getQuantity() >= quantity && item.getStatus().equals(Status.IN_STOCK) || item.getStatus().equals(Status.LIMITED)){

                int newQuantity = item.getQuantity() - quantity;

                //if quantity is less than 0, return false
                if(newQuantity < 0){
                    return false;
                }

                item.setQuantity(newQuantity);
                item = itemRepository.save(item);

                //TODO: send message to kafka
                //Update inventory status

                //If quantity is 0, update status to OUT_OF_STOCK
                if(item.getQuantity() == 0){
                    item.setStatus(Status.OUT_OF_STOCK);
                    itemRepository.save(item);
                }

                //If quantity is less than 10, update status to LIMITED
                //Save item
                else if(item.getQuantity() < 10){
                    item.setStatus(Status.LIMITED);
                    itemRepository.save(item);
                }

                else {
                    item.setStatus(Status.IN_STOCK);
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
        item.setStatus(Status.IN_STOCK);
        item.setCurrency(request.getCurrency());
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
