package com.order_service.grpc;

import com.order_service.dto.AddressDTO;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.proto.grpc.AddressesResponse;
import org.proto.grpc.UserRequest;
import org.proto.grpc.UserResponse;
import org.proto.grpc.UserServiceGrpc;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;


@Service
public class UserService {

    final static Logger LOGGER = LoggerFactory.getLogger(UserService.class);

    @GrpcClient("user-grpc-server")
    private UserServiceGrpc.UserServiceBlockingStub userServiceBlockingStub;

    public UserResponse getUser(String userId) {
        LOGGER.info("getUser");
        UserRequest request = UserRequest.newBuilder().setId(userId).build();
        LOGGER.info("request: {}", request);
        return userServiceBlockingStub.getUser(request);
    }

    public List<AddressDTO> getAddresses(String userId) {

        LOGGER.info("Getting addresses for user: " + userId);
        UserRequest request = UserRequest.newBuilder().setId(userId).build();
        LOGGER.info("Request: " + request);

        List<AddressDTO> addresses = new ArrayList<>();
        AddressesResponse response = userServiceBlockingStub.getAddresses(request);
        response.getAddressesList().forEach(addressResponse -> {
            AddressDTO address = new AddressDTO(addressResponse);
            addresses.add(address);
        });

        return addresses;
    }
}
