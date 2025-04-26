package com.user_service.grpc;

import com.google.firebase.auth.UserRecord;
import com.user_service.models.Address;
import com.user_service.models.User;
import com.user_service.service.FirebaseService;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.proto.grpc.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.logging.Logger;


@GrpcService
public class UserServiceImp extends UserServiceGrpc.UserServiceImplBase {

    private static final java.util.logging.Logger LOGGER = Logger.getLogger(UserServiceImp.class.getName());

    private final FirebaseService firebaseService;

    @Autowired
    public UserServiceImp(FirebaseService firebaseService) {
        this.firebaseService = firebaseService;
    }

    /**
     message UserResponse {
     string id = 1;
     string provider_id = 2;
     optional string name = 3;
     string email = 4;
     optional string photo_url = 5;
     optional string phone_number = 6;
     bool email_verified = 7;
     bool is_disabled = 8;
     int64 created_at = 9;
     int64 last_sign_in = 10;
     }
     */

    @Override
    public void getUser(UserRequest request, StreamObserver<UserResponse> responseObserver) {

        String userId = request.getId();
        User user = firebaseService.getUser(userId);

        UserResponse.Builder responseBuilder = UserResponse.newBuilder()
                .setId(user.getId())
                .setProviderId(user.getProviderId())
                .setEmail(user.getEmail())
                .setEmailVerified(user.isEmailVerified())
                .setIsDisabled(user.isDisabled())
                .setCreatedAt(user.getCreated())
                .setLastSignIn(user.getLastSignIn());

        if (user.getCustomerId() != null) {
            responseBuilder.setCustomerId(user.getCustomerId());
        }
        if (user.getDisplayName() != null) {
            responseBuilder.setName(user.getDisplayName());
        }
        if (user.getPhotoUrl() != null) {
            responseBuilder.setPhotoUrl(user.getPhotoUrl());
        }
        if (user.getPhoneNumber() != null) {
            responseBuilder.setPhoneNumber(user.getPhoneNumber());
        }

        UserResponse response = responseBuilder.build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }


    /**
     message UserUpdateRequest {
     string id = 1;
     optional string email = 2;
     optional string photo_url = 3;
     optional bool email_verified = 5;
     optional bool is_disabled = 6;
     optional string customer_id = 7;
     }
     */

    /**
     message AddressResponse {
     string id = 1;
     string user_id = 2;
     string street = 3;
     string city = 4;
     string state = 5;
     string country = 6;
     string postal_code = 7;
     }
     */
    @Override
    public void getAddress(AddressRequest request, StreamObserver<AddressResponse> responseObserver) {
        // Get address from user service
        User user = firebaseService.getUser(request.getId());
        Address address = firebaseService.getAddress(request.getId(), request.getId());
        AddressResponse.Builder responseBuilder = AddressResponse.newBuilder()
                .setId(address.getId())
                .setAddressLine1(address.getStreet())
                .setCity(address.getCity())
                .setState(address.getState())
                .setCountry(address.getCountry())
                .setPostalCode(address.getPostcode())
                .setIsDefault(address.getIsDefault());

        AddressResponse response = responseBuilder.build();
        responseObserver.onNext(response);

        responseObserver.onCompleted();
    }

    @Override
    public void getAddresses(UserRequest request, StreamObserver<AddressesResponse> responseObserver) {

        LOGGER.info("Getting addresses for user: " + request.getId());
        // Get all addresses from user service
        User user = firebaseService.getUser(request.getId());
        List<Address> addresses = firebaseService.getUserAddresses(user.getId());

        AddressesResponse.Builder responseBuilder = AddressesResponse.newBuilder();
        for (Address address : addresses) {
            AddressResponse addressResponse = AddressResponse.newBuilder()
                    .setId(address.getId())
                    .setAddressLine1(address.getStreet())
                    .setCity(address.getCity())
                    .setState(address.getState())
                    .setCountry(address.getCountry())
                    .setPostalCode(address.getPostcode())
                    .setIsDefault(address.getIsDefault())
                    .build();
            responseBuilder.addAddresses(addressResponse);
        }

        AddressesResponse response = responseBuilder.build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void deleteAddress(AddressRequest request, StreamObserver<AddressResponse> responseObserver) {

        LOGGER.info("Getting addresses for user: " + request.getId());
        // Get all addresses from user service
        User user = firebaseService.getUser(request.getId());
        Address address = firebaseService.getAddress(request.getUserId(), user.getId());
        firebaseService.deleteAddress(user.getId(), address.getId());

        AddressResponse.Builder responseBuilder = AddressResponse.newBuilder();
        responseBuilder.setId(address.getId());
        responseBuilder.setAddressLine1(address.getStreet());
        responseBuilder.setCity(address.getCity());
        responseBuilder.setState(address.getState());
        responseBuilder.setCountry(address.getCountry());
        responseBuilder.setPostalCode(address.getPostcode());
        responseBuilder.setIsDefault(address.getIsDefault());

        responseObserver.onNext(responseBuilder.build());
        responseObserver.onCompleted();
    }

    @Override
    public void addAddress(AddAddressRequest request, StreamObserver<AddressResponse> responseObserver) {
        com.user_service.DTO.AddressRequest add = new com.user_service.DTO.AddressRequest();
        add.setFirstName(request.getFirstName());
        add.setLastName(request.getLastName());
        add.setStreet(request.getAddressLine1());
        add.setCity(request.getCity());
        add.setState(request.getState());
        add.setPostcode(request.getPostalCode());
        add.setCountry(request.getCountry());
        add.setIsDefault(request.getIsDefault());

        Address address = firebaseService.addAddress(request.getUid(), add);
        AddressResponse.Builder responseBuilder = AddressResponse.newBuilder();
        responseBuilder.setId(address.getId());
        responseBuilder.setAddressLine1(address.getStreet());
        responseBuilder.setCity(address.getCity());
        responseBuilder.setState(address.getState());
        responseBuilder.setCountry(address.getCountry());
        responseBuilder.setPostalCode(address.getPostcode());
        responseBuilder.setIsDefault(address.getIsDefault());

        responseObserver.onNext(responseBuilder.build());
        responseObserver.onCompleted();
    }

    @Override
    public void updateAddress(UpdateAddressRequest request, StreamObserver<AddressResponse> responseObserver) {
        // Get address from user service
        com.user_service.DTO.AddressRequest update = new com.user_service.DTO.AddressRequest();
        update.setFirstName(request.getFirstName());
        update.setLastName(request.getLastName());
        update.setStreet(request.getAddressLine1());
        update.setCity(request.getCity());
        update.setState(request.getState());
        update.setPostcode(request.getPostalCode());
        update.setCountry(request.getCountry());
        update.setIsDefault(request.getIsDefault());

        Address address = firebaseService.updateAddress(request.getUid(), request.getId(), update);
        AddressResponse.Builder responseBuilder = AddressResponse.newBuilder()
                .setId(address.getId())
                .setAddressLine1(address.getStreet())
                .setCity(address.getCity())
                .setState(address.getState())
                .setCountry(address.getCountry())
                .setPostalCode(address.getPostcode())
                .setIsDefault(address.getIsDefault());

        AddressResponse response = responseBuilder.build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

}
