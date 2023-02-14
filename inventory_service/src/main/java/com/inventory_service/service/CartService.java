package com.inventory_service.service;

import com.inventory_service.DTO.CartDTO;
import com.inventory_service.DTO.CartResponse;
import com.inventory_service.DTO.MovieDTO;
import com.inventory_service.model.Cart;
import com.inventory_service.model.Item;
import com.inventory_service.repository.CartRepository;
import com.inventory_service.repository.ItemRepository;
import com.inventory_service.service_grpc.MovieService;
import org.proto.grpc.MovieResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.NumberFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartService implements  CartServiceImp {

    private CartRepository cartRepository;
    private ItemRepository itemService;
    private MovieService movieService;
    public CartResponse builder(Cart cart) {
        CartResponse cartResponse = new CartResponse();
        cartResponse.setId(cart.getId());
        cartResponse.setQuantity(cart.getQuantity());
        cartResponse.setUserId(cart.getUserId());
        cartResponse.setItemId(cart.getItemId());

        MovieResponse movie = movieService.getMovie(cart.getItemId());

        MovieDTO movieDTO = new MovieDTO();
        movieDTO.setId(movie.getId());
        movieDTO.setTitle(movie.getTitle());
        movieDTO.setYear(movie.getYear());
        movieDTO.setPoster(movie.getPoster());

        NumberFormat formatter = NumberFormat.getCurrencyInstance();
        Optional<Item> item = itemService.findById(cart.getItemId());
        String price = formatter.format(item.get().getPrice());

        if(item.isPresent()) {
            cartResponse.setPrice(price);
        }

        cartResponse.setMovie(movieDTO);

        return cartResponse;
    }


    @Autowired
    CartService(CartRepository cartRepository, ItemRepository itemService, MovieService movieService) {
        this.cartRepository = cartRepository;
        this.itemService = itemService;
        this.movieService = movieService;
    }

    @Override
    public ResponseEntity<?> getAll(Pageable pagable) {
        Page<Cart> carts = cartRepository.findAll(pagable);
        return ResponseEntity.ok(carts);
    }

    @Override
    public ResponseEntity<?> findAllByItemId(String itemId, Pageable pagable) {
        Page<Cart> carts = cartRepository.findAllByItemId(itemId, pagable);
        return ResponseEntity.ok(carts);
    }

    @Override
    public ResponseEntity<?> addItem(CartDTO request) {


        Optional<Cart> cart = cartRepository.findByItemIdAndUserId(request.getItemId(), request.getUserId());
        if(cart.isPresent()){
            cart.get().setQuantity(cart.get().getQuantity() + request.getQuantity());
            cart.get().setUpdated(new Date());
            Cart save = cartRepository.save(cart.get());
            return ResponseEntity.ok(save);
        }

        Cart newCart = new Cart();
        newCart.setItemId(request.getItemId());
        newCart.setUserId(request.getUserId());
        newCart.setQuantity(request.getQuantity());
        newCart.setCreated(new Date());
        newCart.setUpdated(new Date());

        Cart save = cartRepository.save(newCart);
        return ResponseEntity.ok(save);
    }

    @Override
    public ResponseEntity<?> removeItem(CartDTO request) {

        Optional<Cart> cart = cartRepository.findById(request.getId());
        if(cart.isPresent()){
            cartRepository.delete(cart.get());
            return ResponseEntity.ok("Item removed from cart");
        }
        return ResponseEntity.ok("Item not found");
    }

    @Override
    public ResponseEntity<?> updateItem(CartDTO request) {
        Optional<Cart> cart = cartRepository.findById(request.getId());
        if(cart.isPresent()){
            cart.get().setQuantity(request.getQuantity());
            cart.get().setUpdated(new Date());
            Cart save = cartRepository.save(cart.get());
            return ResponseEntity.ok(save);
        }
        return ResponseEntity.ok("Item not found");
    }

    @Override
    public ResponseEntity<?> clearCart(CartDTO request) {

        cartRepository.deleteAllByUserId(request.getUserId());
        return ResponseEntity.ok("Cart cleared");
    }

    @Override
    public ResponseEntity<?> getCart(CartDTO request) {
        Optional<Cart> cart = cartRepository.findById(request.getId());
        if(cart.isPresent()){
            CartResponse cartResponse = builder(cart.get());
            return ResponseEntity.ok(cartResponse);

        }
        return ResponseEntity.ok("Item not found");
    }

    @Override
    public ResponseEntity<?> getCartItems(CartDTO request) {
        List<Cart> cart = cartRepository.findAllByUserId(request.getUserId());
        List<CartResponse> cartResponse = new java.util.ArrayList<>();

        for (Cart item : cart) {
            CartResponse cartResponse1 = builder(item);
            cartResponse.add(cartResponse1);
        }

        return ResponseEntity.ok(cartResponse);
    }

    @Override
    public ResponseEntity<?> getCartItemsQty(CartDTO request) {
        List<Cart> cart = cartRepository.findAllByUserId(request.getUserId());
        int qty = 0;
        for (Cart cart1 : cart) {
            qty += cart1.getQuantity();
        }
        return ResponseEntity.ok(qty);
    }

    @Override
    public ResponseEntity<?> getCartByUserId(String userId) {
        List<Cart> cart = cartRepository.findAllByUserId(userId);
        List<CartResponse> cartResponse = new java.util.ArrayList<>();

        for (Cart item : cart) {
            CartResponse cartResponse1 = builder(item);
            cartResponse.add(cartResponse1);
        }

        return ResponseEntity.ok(cartResponse);
    }
}