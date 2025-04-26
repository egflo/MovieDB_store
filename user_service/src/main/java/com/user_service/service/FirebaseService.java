package com.user_service.service;


import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserMetadata;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.cloud.FirestoreClient;
import com.stripe.model.tax.Registration;
import com.user_service.DTO.AddressRequest;
import com.user_service.DTO.BookmarkDTO;
import com.user_service.DTO.BookmarkRequest;
import com.user_service.DTO.UserRequest;
import com.user_service.exception.FirebaseServiceException;
import com.user_service.grpc.MovieService;
import com.user_service.models.Address;
import com.user_service.models.Bookmark;
import com.user_service.models.Movie;
import com.user_service.models.User;
import org.proto.grpc.MovieResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.logging.Logger;

@Service
public class FirebaseService {

    private static final Logger LOGGER = Logger.getLogger("FirebaseService");

    private final Firestore db;

    @Autowired
    private MovieService movieService;

    public FirebaseService() {
        try {
            this.db = FirestoreClient.getFirestore();
            LOGGER.info("Firestore initialized successfully");
        } catch (Exception e) {
            LOGGER.severe("Error initializing Firestore: " + e.getMessage());
            throw new FirebaseServiceException("Error initializing Firestore", e);
        }
    }

    public UserRecord getUserAuth(String id) {
        try {
            UserRecord userRecord = FirebaseAuth.getInstance().getUser(id);
            UserMetadata userMeta = userRecord.getUserMetadata();

            LOGGER.info("Successfully fetched user data: " + userRecord);

            return userRecord;
        } catch (Exception e) {
            throw new FirebaseServiceException("Error getting user: " + e.getMessage());
        }
    }

    public User getUser(String userId) {
        UserRecord userRecord = getUserAuth(userId);

        DocumentReference docRef = db.collection("users").document(userId);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = null;
        try {
            document = future.get();
            if (document.exists()) {
                // Convert document to User class
                User user = document.toObject(User.class);
                assert user != null;
                user.setId(document.getId());
                user.setEmail(userRecord.getEmail());
                user.setDisplayName(userRecord.getDisplayName());
                user.setPhotoUrl(userRecord.getPhotoUrl());
                user.setPhoneNumber(userRecord.getPhoneNumber());
                user.setEmailVerified(userRecord.isEmailVerified());
                user.setDisabled(userRecord.isDisabled());
                user.setCreated(userRecord.getUserMetadata().getCreationTimestamp());
                user.setLastSignIn(userRecord.getUserMetadata().getLastSignInTimestamp());
                user.setProviderId(userRecord.getProviderId());

                List<Address> addresses = getUserAddresses(userId);
                user.setAddresses(addresses);
                LOGGER.info("User" + user);

                return user;
            } else {
                System.out.println("No such document!");
                //Create user if it does not exist
                addUser(userId);
                return getUser(userId);
            }

        } catch (InterruptedException | ExecutionException e) {
            throw new FirebaseServiceException("Error getting user with id: " + userId);
        }
    }

    public String createUser(UserRequest user) {
        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(user.getEmail())
                .setPassword(user.getPassword());

        try {
            //Create a user in firebase auth
            UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);
            LOGGER.info("Successfully created new user: " + userRecord.getUid());

            //Create a user in firestore
            User newUser = addUser(userRecord.getUid());
            LOGGER.info("Successfully created new user in firestore: " + newUser);

            return userRecord.getUid();
        } catch (Exception e) {
            throw new FirebaseServiceException("Error creating user: " + e.getMessage());

        }
    }

    public UserRecord updateUser(String id, UserRequest user) {
        //Only update user if it exists and fields are not null
        if (userExists(id)) {
            UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(id);

            if (user.getEmail() != null) {
                request.setEmail(user.getEmail());
            }
            if (user.getPassword() != null) {
                request.setPassword(user.getPassword());
            }
            if (user.getDisplayName() != null) {
                request.setDisplayName(user.getDisplayName());
            }
            if (user.getPhotoUrl() != null) {
                request.setPhotoUrl(user.getPhotoUrl());
            }

            try {
                UserRecord userRecord = FirebaseAuth.getInstance().updateUser(request);
                LOGGER.info("Successfully updated user: " + userRecord.getUid());
                return userRecord;
            } catch (Exception e) {
                throw new FirebaseServiceException("Error updating user: " + e.getMessage());
            }
        }

        throw new FirebaseServiceException("User does not exist");
    }

    private boolean userExists(String id) {
        try {
            //Firebase database
            DocumentReference docRef = db.collection("users").document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            User userRecord = document.toObject(User.class);

            return userRecord != null;
        } catch (Exception e) {
            return false;
        }
    }

    public User addUser(String id) {
        try {
            UserRecord record = getUserAuth(id);
            //Check if user already exists
            if (userExists(id)) {
                throw new FirebaseServiceException("User already exists");
            }
            DocumentReference docRef = db.collection("users").document(id);
            User user = new User(record);
            ApiFuture<WriteResult> result = docRef.set(user);

            if(result.isDone()) {
               Logger.getLogger("FirebaseService").info("User added successfully");
            }

            User resultUser = docRef.get().get().toObject(User.class);
            //get result
            LOGGER.info("User added: " + resultUser);

            return resultUser;

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


    public Bookmark addBookmark(BookmarkRequest request) {
        //check if bookmark already exists
        Bookmark bookmarkExists = getByMovieIdAndUserId(request.getMovieId(), request.getUserId());
        if (bookmarkExists != null) {
            LOGGER.info("Bookmark already exists :: " + bookmarkExists);
            return bookmarkExists;
        }

        DocumentReference docRef = db.collection("users").document(request.getUserId());
        CollectionReference bookmarksSubCollection = docRef.collection("bookmarks");

        Map<String, Object> newBookmark = new HashMap<>();
        newBookmark.put("userId", request.getUserId());
        newBookmark.put("movieId", request.getMovieId());
        newBookmark.put("created", new Date());
        MovieResponse movie = movieService.getMovie(request.getMovieId());
        Movie movieDTO = new Movie(movie);
        newBookmark.put("movie", movieDTO);

        ApiFuture<DocumentReference> addedDocRef = bookmarksSubCollection.add(newBookmark);
        Bookmark bookmark= new Bookmark(request);

        try {
            String bookmarkId = addedDocRef.get().getId();

            bookmark.setId(bookmarkId);
            bookmark.setUserId(newBookmark.get("userId").toString());
            bookmark.setCreated((Date) newBookmark.get("created"));
            bookmark.setMovie(new Movie(movie));

            LOGGER.info("Added document with ID: " + bookmarkId);
            return bookmark;
        } catch (InterruptedException | ExecutionException e) {
            throw new FirebaseServiceException("Error adding bookmark");
        }
    }

    public Bookmark getBookmark(String id, String userId) {
        DocumentReference docRef = db.collection("users").document(userId).collection("bookmarks").document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = null;
        try {
            document = future.get();
        } catch (InterruptedException | ExecutionException e) {
            throw new FirebaseServiceException("Error getting bookmark with id: " + id);
        }
        if (document.exists()) {
            // Convert document to Bookmark class
            Bookmark bookmark = document.toObject(Bookmark.class);
            assert bookmark != null;
            bookmark.setId(document.getId());

            LOGGER.info("Bookmark ID: " + bookmark.getId());

            return bookmark;
        } else {
            throw new FirebaseServiceException("No such document!");
        }
    }

    public void deleteBookmark(String id, String userId) {
        DocumentReference docRef = db.collection("users").document(userId).collection("bookmarks").document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = null;
        try {
            document = future.get();
        } catch (InterruptedException | ExecutionException e) {
            throw new FirebaseServiceException("Error getting bookmark with id: " + id);
        }
        if (document.exists()) {
            Bookmark item = document.toObject(Bookmark.class);
            assert item != null;
            docRef.delete();
        } else {
            throw new FirebaseServiceException("No such document!");
        }
    }

    public Bookmark getByMovieIdAndUserId(String movieId, String userId) {
        Query docRef = db.collection("users").document(userId).collection("bookmarks").whereEqualTo("movieId", movieId);
        ApiFuture<QuerySnapshot> future = docRef.get();
        QuerySnapshot document = null;
        try {
            document = future.get();
        } catch (InterruptedException | ExecutionException e) {
            throw new FirebaseServiceException("Error getting bookmark with id: " + movieId);
        }

        if (!document.isEmpty()) {
            for (DocumentSnapshot doc : document.getDocuments()) {
                Bookmark bookmark = doc.toObject(Bookmark.class);
                assert bookmark != null; // Should not be null if null then throw exception
                bookmark.setId(doc.getId());
                return bookmark;
            }
        }
        LOGGER.info("No such document for movieId: " + movieId + " and userId: " + userId);
        return null;
    }

    public List<Bookmark> getAllBookmarks(String userId, Pageable pageable) {
        DocumentReference docRef = db.collection("users").document(userId);
        CollectionReference bookmarksSubCollection = docRef.collection("bookmarks");

        Query query = bookmarksSubCollection.orderBy("created").limit(pageable.getPageSize());
        ApiFuture<QuerySnapshot> querySnapshot = query.get();
        List<Bookmark> bookmarks = new ArrayList<>();

        try {
            for (DocumentSnapshot document : querySnapshot.get().getDocuments()) {
                Bookmark bookmark = document.toObject(Bookmark.class);
                assert bookmark != null;
                bookmark.setId(document.getId());
                bookmarks.add(bookmark);
            }
        } catch (InterruptedException | ExecutionException e) {
            throw new FirebaseServiceException("Error getting bookmarks");
        }
        return bookmarks;
    }

    public Address addAddress(String userId, AddressRequest request) {
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
        address.put("isDefault", request.getIsDefault());

        // Add the address to the collection and get the DocumentReference
        ApiFuture<DocumentReference> addedDocRef = addressesSubCollection.add(address);
        Address addressDTO = new Address(request);

        try {
            String addressId = addedDocRef.get().getId();
            addressDTO.setId(addressId);
            System.out.println("Added document with ID: " + addressId);
        } catch (InterruptedException | ExecutionException e) {
            throw new FirebaseServiceException("Error adding address");
        }

        return addressDTO;
    }

    public List<Address> getUserAddresses(String userId)  {
        DocumentReference docRef = db.collection("users").document(userId);
        CollectionReference addressesSubCollection = docRef.collection("addresses");
        List<Address> addresses = new ArrayList<>();
        addressesSubCollection.listDocuments().forEach(documentReference -> {
            try {
                DocumentSnapshot documentSnapshot = documentReference.get().get();
                AddressRequest addressRequest = documentSnapshot.toObject(AddressRequest.class);
                if (addressRequest != null) {
                    addressRequest.setId(documentSnapshot.getId()); // Set the ID
                    addresses.add(new Address(addressRequest));
                }
            } catch (ExecutionException | InterruptedException e) {
                throw new FirebaseServiceException("Error getting addresses");
            }
        });
        return addresses;
    }

    public Address updateAddress(String userId, String addressId, AddressRequest request) {
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

        Address addressDTO = new Address(request);
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

    public void deleteAddress(String userId, String addressId) {
        DocumentReference docRef = db.collection("users").document(userId);
        CollectionReference addressesSubCollection = docRef.collection("addresses");

        try {
            DocumentReference addressRef = addressesSubCollection.document(addressId);
            ApiFuture<DocumentSnapshot> future = addressRef.get();
            DocumentSnapshot document = future.get();
            if (document.exists()) {
                Address item = document.toObject(Address.class);
                assert item != null;
                docRef.collection("addresses").document(addressId).delete();
            } else {
                System.out.println("No such document!");
            }
        } catch (InterruptedException | ExecutionException e) {
            throw new FirebaseServiceException("Error getting address with id: " + addressId);
        }
    }

    public Address getAddress(String subject, String id) {
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
            Address addressRequest = document.toObject(Address.class);
            if (addressRequest != null) {
                addressRequest.setId(document.getId()); // Set the ID
                return addressRequest;
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
