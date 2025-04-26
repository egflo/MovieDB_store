package com.user_service.controller;

import com.user_service.DTO.AddressRequest;
import com.user_service.service.FirebaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/address")
public class AddressController {

    @Autowired
    private FirebaseService firebaseService;

    @PostMapping("/address")
    public ResponseEntity<?> addAddress(
            @RequestHeader(value = "uid", required = true ) String userId,
            @RequestBody AddressRequest address) {
        return ResponseEntity.ok(firebaseService.addAddress(userId, address));
    }

    @GetMapping("/address")
    public ResponseEntity<?>
    getAddress(@RequestHeader(value = "uid", required = true) String userId) {
        return ResponseEntity.ok(firebaseService.getUserAddresses(userId));
    }

    @DeleteMapping("/address/{id}")
    public ResponseEntity<?> deleteAddress(
            @RequestHeader(value = "uid", required = true) String userId,
            @PathVariable String id) {
        firebaseService.deleteAddress(userId, id);
        return ResponseEntity.ok("Address Deleted");
    }

    @PostMapping("/address/{id}")
    public ResponseEntity<?> updateAddress(@RequestHeader(value = "uid", required = true) String userId, @PathVariable String id, @RequestBody AddressRequest address) {
        return ResponseEntity.ok(firebaseService.updateAddress(userId, id, address));
    }

    @GetMapping("/address/{id}")
    public ResponseEntity<?> getAddress(@RequestHeader(value = "uid", required = true) String userId,
                                        @PathVariable String id) {
        return ResponseEntity.ok(firebaseService.getAddress(userId, id));
    }
}
