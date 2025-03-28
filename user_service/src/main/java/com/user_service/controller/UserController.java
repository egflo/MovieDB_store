package com.user_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private FirebaseService firebaseService;

    @Autowired
    private StripeService stripeService;


    @GetMapping
    public List<User> getAllUsers() throws ExecutionException, InterruptedException {
        return firebaseService.getAllUsers();
    }

    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        return ResponseEntity.ok(firebaseService.createUser(user));
    }


    @PostMapping
    public void addUser(@RequestBody User user) {
        firebaseService.addUser(user.getId(), user.getCustomerId(), user.getEmail()); // user.getId() is the id of the user
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        firebaseService.deleteUser(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable String id) {
        return ResponseEntity.ok(firebaseService.getUser(id));
    }

    @GetMapping("/")
    public ResponseEntity<?> getUser(@RequestHeader HttpHeaders headers) {
        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();
        return ResponseEntity.ok(firebaseService.getUser(subject));
    }

    //Add adderesses to user
    @PostMapping("/address")
    public ResponseEntity<?> addAddress(@RequestHeader HttpHeaders headers, @RequestBody AddressRequest address) {
        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();
        return ResponseEntity.ok(firebaseService.addAddress(subject, address));
    }

    @GetMapping("/address")
    public ResponseEntity<?>
    getAddress(@RequestHeader HttpHeaders headers) {
        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();
        return ResponseEntity.ok(firebaseService.getUserAddresses(subject));
    }

    @DeleteMapping("/address/{id}")
    public ResponseEntity<?> deleteAddress(@RequestHeader HttpHeaders headers, @PathVariable String id) {
        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();
        return ResponseEntity.ok(firebaseService.deleteAddress(subject, id));
    }

    @PostMapping("/address/{id}")
    public ResponseEntity<?> updateAddress(@RequestHeader HttpHeaders headers, @PathVariable String id, @RequestBody AddressRequest address) {
        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();
        return ResponseEntity.ok(firebaseService.updateAddress(subject, id, address));
    }

    @GetMapping("/address/{id}")
    public ResponseEntity<?> getAddress(@RequestHeader HttpHeaders headers, @PathVariable String id) {
        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();
        return ResponseEntity.ok(firebaseService.getAddress(subject, id));
    }

    @PostMapping("/address/{id}/default")
    public ResponseEntity<?> setDefaultAddress(@RequestHeader HttpHeaders headers, @PathVariable String id) {
        String token = Objects.requireNonNull(headers.get("authorization")).get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();
        return ResponseEntity.ok(firebaseService.setDefaultAddress(subject, id));
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<?> getPaymentMethods(@RequestHeader HttpHeaders headers) {
        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();
        return ResponseEntity.ok(stripeService.getPaymentMethods(subject));
    }

    @PostMapping("/payment-methods/default/{id}")
    public ResponseEntity<?> defaultPaymentMethods(@RequestHeader HttpHeaders headers, @PathVariable String id) {
        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();
        stripeService.setDefaultPaymentMethod(subject,id);
        return ResponseEntity.ok("Payment Updated");
    }

    @PutMapping("/payment-methods/{id}")
    public ResponseEntity<?> addPaymentMethods(@RequestHeader HttpHeaders headers, @PathVariable String id) {
        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();
        stripeService.addPaymentMethod(subject,id);
        return ResponseEntity.ok("Payment Added");
    }

    @DeleteMapping("/payment-methods/{id}")
    public ResponseEntity<?> deletePaymentMethods(@RequestHeader HttpHeaders headers, @PathVariable String id) {
        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();
        stripeService.deletePaymentMethod(id);
        return ResponseEntity.ok("Payment Deleted");
    }

}