package com.order_service.service;

import net.devh.boot.grpc.client.inject.GrpcClient;
import org.proto.grpc.UserRequest;
import org.proto.grpc.UserResponse;
import org.proto.grpc.UserServiceGrpc;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @GrpcClient("user-grpc-server")
    private UserServiceGrpc.UserServiceBlockingStub userServiceBlockingStub;

    public UserResponse getUser(String userId) {
        UserRequest request = UserRequest.newBuilder().setId(userId).build();
        return userServiceBlockingStub.getUser(request);
    }
}
