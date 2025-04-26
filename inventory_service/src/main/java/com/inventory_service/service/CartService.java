package com.inventory_service.service;

import com.inventory_service.DTO.CartDTO;
import com.inventory_service.DTO.CartItemDTO;
import com.inventory_service.DTO.CartRequest;
import com.inventory_service.exception.IdNotFoundException;
import com.inventory_service.exception.InventoryException;
import com.inventory_service.model.*;
import com.inventory_service.repository.CartRepository;
import com.inventory_service.grpc.MovieService;
import org.proto.grpc.MovieResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@Service
@Transactional
public class CartService implements CartServiceImp {

    private static final Logger LOGGER = Logger.getLogger(CartService.class.getName());

    private final CartRepository cartRepository;
    private final ItemService itemService;
    private final MovieService movieService;

    @Autowired
    CartService(CartRepository cartRepository, ItemService itemService, MovieService movieService) {
        this.cartRepository = cartRepository;
        this.itemService = itemService;
        this.movieService = movieService;
    }

    @Override
    public CartDTO findAllByUserId(String userId) {
        return cartRepository.findByUserId(userId)
                .map(cart -> {
                    CartDTO cartDTO = new CartDTO(cart);
                    //MovieResponse movie = movieService.getMovie(cart.getId());
                    //cartDTO.setMovie(movie);
                    return cartDTO;
                })
                .orElseThrow(() -> new IdNotFoundException("Cart id not found"));
    }

    @Override
    public Page<CartDTO> getAll(Pageable pageable) {
        return cartRepository.findAll(pageable)
                .map(cart -> {
                    CartDTO cartDTO = new CartDTO(cart);
                    //MovieResponse movie = movieService.getMovie(cart.getCartId());
                    //cartDTO.setMovie(movie);
                    return cartDTO;
                });
    }

    @Override
    public Page<CartDTO> findAllByItemId(String itemId, Pageable pageable) {
        return cartRepository.findAllByCartItems_ItemId(itemId, pageable)
                .map(cart -> {
                    CartDTO cartDTO = new CartDTO(cart);
                    //MovieResponse movie = movieService.getMovie(cart.getCartId());
                    //cartDTO.setMovie(movie);
                    return cartDTO;
                });
    }

    @Override
    public CartDTO add(CartRequest request) {
        LOGGER.info("Adding to cart: " + request.toString());

        // Check if item exists
       MovieResponse movie = movieService.getMovie(request.getItemId());
        if (movie == null) {
            throw new InventoryException("Item not found for this id :: " + request.getItemId());
        }

        // Check if item is in stock
        //Check if item is in stock and quantity is available throws exception if not
        LOGGER.info("Checking inventory for item: " + request.getItemId());
        Product product = itemService.updateInventory(request.getItemId(), request.getQuantity(), Type.STOCK_OUT);

        //Get users cart
        LOGGER.info("Retrieving cart for user: " + request.getUserId());
        Optional<Cart> optionalCart = cartRepository.findByUserId(request.getUserId());

        //If cart exists, add item to cart
        if (optionalCart.isPresent()) {
            LOGGER.info("Found cart for user: " + request.getUserId());

            Cart cart = optionalCart.get();

            Optional<CartItem> optionalCartItem = cart.getCartItems().stream()
                    .filter(cartItem -> cartItem.getItemId().equals(request.getItemId()))
                    .findFirst();

            //If item already exists in cart, update quantity
            if (optionalCartItem.isPresent()) {
                CartItem cartItem = optionalCartItem.get();
                cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
                cart.setUpdated(new Date());
            }

            else {
                CartItem cartItem = new CartItem(movie, request.getQuantity(), product.getPrice());
                cart.addCartItem(cartItem);
                cart.setUpdated(new Date());

            }

            LOGGER.info("Updating cart :: " + cart);

            Cart savedCart = cartRepository.save(cart);
            LOGGER.info("Cart successfully added");
            return new CartDTO(savedCart);

        }

        //If cart does not exist, create new cart
        else {
            LOGGER.info("Creating new cart for user: " + request.getUserId());

            Cart cart = new Cart(request.getUserId(), new Date(), new Date());
            CartItem cartItem = new CartItem(movie, request.getQuantity(), product.getPrice());
            cart.addCartItem(cartItem);

            Cart savedCart = cartRepository.save(cart);
            LOGGER.info("Cart successfully added :: Id" + savedCart.getId());
            return new CartDTO(savedCart);
        }

    }

    @Override
    public void delete(String userId, Integer id) {
        LOGGER.info("Deleting from cart: " + id);

        Optional<Cart> optionalCart = cartRepository.findByUserId(userId);
        if(optionalCart.isPresent()){

            Cart cart = optionalCart.get();
            // Optionally update inventory
            CartItem item = cart.getCartItems().stream()
                    .filter(cartItem -> cartItem.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new IdNotFoundException("Cart item id not found"));

            cart.removeCartItem(item);

            LOGGER.info("Cart item successfully removed :: " + cart);

            cartRepository.save(cart);

            //Update inventory
            //itemService.updateInventory(item.getItemId(), item.getQuantity(), Type.STOCK_IN);

            LOGGER.info("Cart successfully deleted");

        }
        else{
            throw new IdNotFoundException("Cart id not found");
        }
    }

    @Override
    public CartDTO update(CartRequest request) {
        LOGGER.info("Updating from cart: " + request.toString());

        Optional<Cart> optionalCart = cartRepository.findByUserId(request.getUserId());
        if(optionalCart.isPresent()){
            Cart cart = optionalCart.get();
            CartItem update = cart.getCartItems().stream()
                    .filter(cartItem -> cartItem.getId().equals(request.getId()))
                    .findFirst()
                    .orElseThrow(() -> new IdNotFoundException("Cart item id not found"));


            //Update inventory for previous quantity
            itemService.updateInventory(update.getItemId(), update.getQuantity(), Type.STOCK_IN);

            update.setQuantity(request.getQuantity());
            cart.setUpdated(new Date());
            cartRepository.save(cart);

            //Update inventory for new quantity
            itemService.updateInventory(update.getItemId(), request.getQuantity(), Type.STOCK_OUT);


            LOGGER.info("Cart successfully updated");
            return new CartDTO(cart);
        }
        else{
            throw new IdNotFoundException("Cart id not found");
        }
    }

    @Override
    public CartDTO findById(Integer id) {
        LOGGER.info("Finding cart by id: " + id);
        Optional<Cart> cart = cartRepository.findById(id);
        LOGGER.info("Cart successfully found");
        if(cart.isPresent()){
            return new CartDTO(cart.get());
        }
        else{
            throw new IdNotFoundException("Cart id not found");
        }
    }


}