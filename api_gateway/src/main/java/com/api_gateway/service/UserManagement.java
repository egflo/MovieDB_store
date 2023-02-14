package com.api_gateway.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


//https://medium.com/@sebastijan.comsysto/role-based-authorization-rbac-with-firebase-auth-custom-claims-and-spring-security-part-2-3-6125c6fc7c4
@Service
public class UserManagement {

    private final FirebaseAuth firebaseAuth;

    public UserManagement(FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    public void setUserClaims(String uid, List<Role> roles) throws FirebaseAuthException {

        List<String> permissions = roles
                .stream()
                .map(Enum::toString)
                .collect(Collectors.toList());

        firebaseAuth.setCustomUserClaims(uid, Map.of("roles", permissions));

        if (roles.contains(Role.ADMIN)) {
            Map<String, Object> claims = new HashMap<>();
            claims.put("admin", true);

            //firebaseAuth.setCustomUserClaims(uid, claims);
        }
    }

    public boolean isUserAdmin(String token) throws FirebaseAuthException {
        return firebaseAuth.verifyIdToken(token).getClaims().get("role").toString().equals("admin");
    }

    public boolean isUserAuthenticated(String token) throws FirebaseAuthException {
        return firebaseAuth.verifyIdToken(token).isEmailVerified();
    }

    public String getUserEmail(String token) throws FirebaseAuthException {
        return firebaseAuth.verifyIdToken(token).getEmail();
    }

    public String getUserUid(String token) throws FirebaseAuthException {
        return firebaseAuth.verifyIdToken(token).getUid();
    }

    public String getUserRole(String token) throws FirebaseAuthException {
        return firebaseAuth.verifyIdToken(token).getClaims().get("role").toString();
    }

    public String getUserFirstName(String token) throws FirebaseAuthException {
        return firebaseAuth.verifyIdToken(token).getClaims().get("firstName").toString();
    }

    public String getUserLastName(String token) throws FirebaseAuthException {
        return firebaseAuth.verifyIdToken(token).getClaims().get("lastName").toString();
    }



}
