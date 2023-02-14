package com.api_gateway.controller;


import com.api_gateway.service.Role;
import com.api_gateway.service.UserManagement;
import com.google.firebase.auth.FirebaseAuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("/")
public class UserController {

    @Autowired
    private UserManagement service;
    //@Secured("ROLE_ANONYMOUS")
    @PostMapping(path = "/user-claims/{uid}")
    public void setUserClaims(
            @PathVariable String uid,
            @RequestBody List<Role> requestedClaims
    ) throws FirebaseAuthException {
        service.setUserClaims(uid, requestedClaims);
    }
}
