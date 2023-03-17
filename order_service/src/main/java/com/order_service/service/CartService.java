package com.order_service.service;


import net.devh.boot.grpc.client.inject.GrpcClient;
import org.proto.grpc.CartRequest;
import org.proto.grpc.CartResponse;
import org.proto.grpc.CartServiceGrpc;
import org.springframework.stereotype.Service;

@Service
public class CartService {

    @GrpcClient("inventory-grpc-server")
    private CartServiceGrpc.CartServiceBlockingStub cartServiceBlockingStub;

    public CartResponse getCart(String userId) {
        CartRequest request = CartRequest.newBuilder().setUserId(userId).build();
        return cartServiceBlockingStub.getCart(request);
    }
}
