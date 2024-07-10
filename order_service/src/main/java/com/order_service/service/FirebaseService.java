package com.order_service.service;


import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.order_service.dto.AddressDTO;
import com.order_service.dto.PaymentMethodDTO;
import com.order_service.dto.UserDTO;
import com.order_service.exception.FirebaseServiceException;
import com.order_service.model.User;
import com.order_service.model.UserAddress;
import com.order_service.request.AddressRequest;
import com.stripe.model.Address;
import com.stripe.model.Customer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class FirebaseService {

    private final Firestore db;

    public FirebaseService() {
        this.db = FirestoreClient.getFirestore();
    }

    public void addUser(String id, String customerId, String email) {

        try {
            DocumentReference docRef = db.collection("users").document(id);
            User user = new User(id, customerId, email);
            ApiFuture<WriteResult> result = docRef.set(user);
        } catch (Exception e) {
            throw new FirebaseServiceException("Error adding user");
        }
    }

    public void addUser(String id, String customerId) {
        try {
            DocumentReference docRef = db.collection("users").document(id);
            User user = new User(id, customerId);
            ApiFuture<WriteResult> result = docRef.set(user);
        } catch (Exception e) {
            throw new FirebaseServiceException("Error adding user");
        }
    }


    public void deleteUser(String id) {
        try {
            ApiFuture<WriteResult> writeResult = db.collection("users").document(id).delete();
        } catch (Exception e) {
            throw new FirebaseServiceException("Error deleting user");
        }

    }

    public List<User> getAllUsers() throws ExecutionException, InterruptedException {
        List<User> users = new ArrayList<>();
        db.collection("users").listDocuments().forEach(documentReference -> {
            try {
                users.add(documentReference.get().get().toObject(User.class));
            } catch (ExecutionException | InterruptedException e) {
                throw new FirebaseServiceException("Error getting users");
            }
        });
        return users;
    }

    public  boolean userExists(String id) {
        DocumentReference docRef = db.collection("users").document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = null;
        try {
            document = future.get();
        } catch (InterruptedException | ExecutionException e) {
            throw new FirebaseServiceException("Error getting user with id: " + id);
        }
        return document.exists();
    }

    public boolean userExistsByCustomerId(String customerId) {
        Query query = db.collection("users").whereEqualTo("customerId", customerId);
        ApiFuture<QuerySnapshot> querySnapshot = query.get();
        try {
            return !querySnapshot.get().isEmpty();
        } catch (InterruptedException | ExecutionException e) {
            throw new FirebaseServiceException("Error getting user with customerId: " + customerId);
        }
    }



    public UserDTO getUser(String userId) {
        DocumentReference docRef = db.collection("users").document(userId);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = null;
        try {
            document = future.get();
        } catch (InterruptedException | ExecutionException e) {
            throw new FirebaseServiceException("Error getting user with id: " + userId);
        }
        if (document.exists()) {
            // Convert document to User class
            User user = document.toObject(User.class);
            String id = document.getId();

            UserDTO userDTO = new UserDTO(id, user.getCustomerId(), user.getEmail());
            List<AddressDTO> addresses = getUserAddresses(userId);
            userDTO.setAddresses(addresses);

            return userDTO;
        } else {
            System.out.println("No such document!");
            return null;
        }
    }


    //Add address to user
    public AddressDTO addAddress(String userId, AddressRequest request) {

        DocumentReference docRef = db.collection("users").document(userId);
        CollectionReference addressesSubCollection = docRef.collection("addresses");

        // Convert AddressRequest to a Map to be able to store it in Firestore
        Map<String, Object> address = new HashMap<>();
        address.put("firstName", request.getFirstName());
        address.put("lastName", request.getLastName());
        address.put("street", request.getStreet());
        address.put("city", request.getCity());
        address.put("state", request.getState());
        address.put("postcode", request.getPostcode());
        address.put("country", request.getCountry());
        address.put("isDefault", request.isDefault());

        // Add the address to the collection and get the DocumentReference
        ApiFuture<DocumentReference> addedDocRef = addressesSubCollection.add(address);

        AddressDTO addressDTO = new AddressDTO(request);

        try {
            String addressId = addedDocRef.get().getId();
            addressDTO.setId(addressId);
            System.out.println("Added document with ID: " + addressId);
        } catch (InterruptedException | ExecutionException e) {
            throw new FirebaseServiceException("Error adding address");
        }

        return addressDTO;
    }


    public List<AddressDTO> getUserAddresses(String userId)  {
        DocumentReference docRef = db.collection("users").document(userId);
        CollectionReference addressesSubCollection = docRef.collection("addresses");
        List<AddressDTO> addresses = new ArrayList<>();
        addressesSubCollection.listDocuments().forEach(documentReference -> {
            try {
                DocumentSnapshot documentSnapshot = documentReference.get().get();
                AddressRequest addressRequest = documentSnapshot.toObject(AddressRequest.class);
                if (addressRequest != null) {
                    addressRequest.setId(documentSnapshot.getId()); // Set the ID
                    addresses.add(new AddressDTO(addressRequest));
                }
            } catch (ExecutionException | InterruptedException e) {
                throw new FirebaseServiceException("Error getting addresses");
            }
        });
        return addresses;
    }

    public List<String> getAddressIds(String userId) {
        DocumentReference docRef = db.collection("users").document(userId);
        CollectionReference addressesSubCollection = docRef.collection("addresses");
        List<String> addressIds = new ArrayList<>();
        addressesSubCollection.listDocuments().forEach(documentReference -> {
            addressIds.add(documentReference.getId());
        });
        return addressIds;
    }

    public AddressDTO updateAddress(String userId, String addressId, AddressRequest request) {
        DocumentReference docRef = db.collection("users").document(userId);
        DocumentReference addressRef = docRef.collection("addresses").document(addressId);

        Map<String, Object> address = new HashMap<>();
        address.put("firstName", request.getFirstName());
        address.put("lastName", request.getLastName());
        address.put("street", request.getStreet());
        address.put("city", request.getCity());
        address.put("state", request.getState());
        address.put("postcode", request.getPostcode());
        address.put("country", request.getCountry());
        address.put("isDefault", request.isDefault());

        //Get updated address
        ApiFuture<WriteResult> result = addressRef.set(address);

        AddressDTO addressDTO = new AddressDTO(request);
        addressDTO.setId(addressId);
        return addressDTO;
    }

    public void updateUser(String userId, String id) {
        DocumentReference docRef = db.collection("users").document(userId);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = null;
        try {
            document = future.get();
        } catch (InterruptedException | ExecutionException e) {
            throw new FirebaseServiceException("Error getting user with id: " + userId);
        }
        if (document.exists()) {
            User user = document.toObject(User.class);
            assert user != null;
            user.setCustomerId(id);
            docRef.set(user);
        } else {
            System.out.println("No such document!");
        }
    }

    public AddressDTO deleteAddress(String userId, String addressId) {
        DocumentReference docRef = db.collection("users").document(userId);
        CollectionReference addressesSubCollection = docRef.collection("addresses");

        AddressDTO address = null;
        try {
            DocumentReference addressRef = addressesSubCollection.document(addressId);
            ApiFuture<DocumentSnapshot> future = addressRef.get();
            DocumentSnapshot document = future.get();
            if (document.exists()) {
                UserAddress item = document.toObject(UserAddress.class);
                assert item != null;
                address = new AddressDTO(item);
                address.setId(addressId);


                docRef.collection("addresses").document(addressId).delete();

            } else {
                System.out.println("No such document!");
            }
        } catch (InterruptedException | ExecutionException e) {
            throw new FirebaseServiceException("Error getting address with id: " + addressId);
        }

        return address;
    }

    public AddressDTO getAddress(String subject, String id) {
        DocumentReference docRef = db.collection("users").document(subject);
        CollectionReference addressesSubCollection = docRef.collection("addresses");
        DocumentReference addressRef = addressesSubCollection.document(id);
        ApiFuture<DocumentSnapshot> future = addressRef.get();
        DocumentSnapshot document = null;
        try {
            document = future.get();
        } catch (InterruptedException | ExecutionException e) {
            throw new FirebaseServiceException("Error getting address with id: " + id);
        }
        if (document.exists()) {
            // Convert document to AddressRequest class
            AddressRequest addressRequest = document.toObject(AddressRequest.class);
            if (addressRequest != null) {
                addressRequest.setId(document.getId()); // Set the ID
                return new AddressDTO(addressRequest);
            }
        } else {
            throw new FirebaseServiceException("No such document!");
        }
        return null;
    }

    public Object setDefaultAddress(String subject, String id) {
        DocumentReference docRef = db.collection("users").document(subject);
        CollectionReference addressesSubCollection = docRef.collection("addresses");
        List<AddressRequest> addresses = new ArrayList<>();
        addressesSubCollection.listDocuments().forEach(documentReference -> {
            try {
                DocumentSnapshot documentSnapshot = documentReference.get().get();
                AddressRequest addressRequest = documentSnapshot.toObject(AddressRequest.class);
                if (addressRequest != null) {
                    addressRequest.setId(documentSnapshot.getId()); // Set the ID
                    addresses.add(addressRequest);
                }
            } catch (ExecutionException | InterruptedException e) {
                throw new FirebaseServiceException("Error getting addresses");
            }
        });

        for (AddressRequest address : addresses) {
            address.setDefault(address.getId().equals(id));
            updateAddress(subject, address.getId(), address);
        }
        return addresses;
    }

}
