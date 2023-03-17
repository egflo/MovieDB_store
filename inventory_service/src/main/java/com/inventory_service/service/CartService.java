package com.inventory_service.service;

import com.inventory_service.DTO.CartDTO;
import com.inventory_service.DTO.CartResponse;
import com.inventory_service.DTO.MovieDTO;
import com.inventory_service.exception.IdNotFoundException;
import com.inventory_service.exception.InventoryException;
import com.inventory_service.model.Cart;
import com.inventory_service.model.Item;
import com.inventory_service.repository.CartRepository;
import com.inventory_service.repository.ItemRepository;
import com.inventory_service.service_grpc.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.proto.grpc.MovieResponse;
import org.springframework.web.client.ResourceAccessException;

import java.text.NumberFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartService implements CartServiceImp {

    private CartRepository cartRepository;
    private ItemService itemService;
    private MovieService movieService;


    @Autowired
    CartService(CartRepository cartRepository, ItemService itemService, MovieService movieService) {
        this.cartRepository = cartRepository;
        this.itemService = itemService;
        this.movieService = movieService;
    }


    @Override
    public Page<Cart> getAll(Pageable pageable) {
        Page<Cart> carts = cartRepository.findAll(pageable);
        return carts;
    }

    @Override
    public Page<Cart> findAllByItemId(String itemId, Pageable pageable) {
        Page<Cart> carts = cartRepository.findAllByItemId(itemId, pageable);
        return carts;
    }

    @Override
    public Cart add(CartDTO request) {

        System.out.println("CartDTO: " + request.toString());

        Optional<Cart> cart = cartRepository.findByItemIdAndUserId(request.getItemId(), request.getUserId());

        boolean inventory = itemService.inventoryUpdate(request.getItemId(), request.getQuantity());
        if(!inventory){
            throw new InventoryException("Not enough inventory");
        }

        if(cart.isPresent()){
            cart.get().setQuantity(cart.get().getQuantity() + request.getQuantity());
            cart.get().setUpdated(new Date());
            Cart update = cartRepository.save(cart.get());
            return update;
        }

        Cart newCart = new Cart();
        newCart.setItemId(request.getItemId());
        newCart.setUserId(request.getUserId());
        newCart.setQuantity(request.getQuantity());
        newCart.setCreated(new Date());
        newCart.setUpdated(new Date());
        Cart save = cartRepository.save(newCart);
        return save;

    }

    @Override
    public void delete(Integer id) {
        cartRepository.deleteById(id);
    }

    @Override
    public Cart update(CartDTO request) {
        Optional<Cart> cart = cartRepository.findById(request.getId());
        if(cart.isPresent()){
            cart.get().setQuantity(request.getQuantity());
            cart.get().setUpdated(new Date());
            Cart update = cartRepository.save(cart.get());
            return update;
        }
        else{
            throw new IdNotFoundException("Cart id not found");
        }
    }

    @Override
    public Optional<Cart> findById(Integer id) {
        Optional<Cart> cart = cartRepository.findById(id);

        if(cart.isPresent()){
            return cart;
        }
        else{
            throw new IdNotFoundException("Cart id not found");
        }
    }

    @Override
    public List<Cart> findAllByUserId(String userId) {
        return cartRepository.findAllByUserId(userId);
    }
}