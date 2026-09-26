package com.inventory_service.controller;

import com.inventory_service.DTO.ItemDTO;
import com.inventory_service.service.CartService;
import com.inventory_service.service.ItemService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Staff endpoints, all under /admin. The gateway lets
 * /inventory-service/admin/** through only for tokens with the ADMIN role
 * (SecurityConfig ADMIN_PATHS), so an endpoint added here is protected by
 * where it lives. Anything that reads or changes other users' data belongs here.
 */
@RestController
@RequestMapping("/admin")
public class AdminController {

    private final ItemService itemService;
    private final CartService cartService;

    public AdminController(ItemService itemService, CartService cartService) {
        this.itemService = itemService;
        this.cartService = cartService;
    }

    // Products: prices and stock (were POST/PUT /product/, DELETE /product/{id}).

    @PostMapping("/product/")
    public ResponseEntity<?> addProduct(@RequestBody ItemDTO request) {
        return new ResponseEntity<>(itemService.add(request), HttpStatus.CREATED);
    }

    @PutMapping("/product/")
    public ResponseEntity<?> updateProduct(@RequestBody ItemDTO request) {
        return new ResponseEntity<>(itemService.update(request), HttpStatus.OK);
    }

    @DeleteMapping("/product/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        itemService.delete(id);
        return ResponseEntity.ok("Item with id: " + id + " deleted successfully");
    }

    // Every user's carts (were GET /cart/all, /cart/{id}, /cart/item/{id}).

    @GetMapping("/cart/all")
    public ResponseEntity<?> findAllCarts(@RequestParam Optional<Integer> limit,
                                          @RequestParam Optional<Integer> page,
                                          @RequestParam Optional<String> sortBy) {
        return ResponseEntity.ok(cartService.getAll(pageOf(limit, page, sortBy)));
    }

    @GetMapping("/cart/{id}")
    public ResponseEntity<?> findCartById(@PathVariable Integer id) {
        return ResponseEntity.ok(cartService.findById(id));
    }

    /** Carts holding a given title. */
    @GetMapping("/cart/item/{id}")
    public ResponseEntity<?> findCartsByItemId(@PathVariable String id,
                                               @RequestParam Optional<Integer> limit,
                                               @RequestParam Optional<Integer> page,
                                               @RequestParam Optional<String> sortBy) {
        return ResponseEntity.ok(cartService.findAllByItemId(id, pageOf(limit, page, sortBy)));
    }

    private static PageRequest pageOf(Optional<Integer> limit, Optional<Integer> page, Optional<String> sortBy) {
        return PageRequest.of(page.orElse(0), limit.orElse(5), Sort.Direction.ASC, sortBy.orElse("id"));
    }
}
