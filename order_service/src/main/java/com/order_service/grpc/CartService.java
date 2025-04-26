package com.order_service.grpc;


import net.devh.boot.grpc.client.inject.GrpcClient;
import org.proto.grpc.CartRequest;
import org.proto.grpc.CartResponse;
import org.proto.grpc.CartServiceGrpc;
import org.springframework.stereotype.Service;

@Service
public class CartService {

    static final org.slf4j.Logger LOGGER = org.slf4j.LoggerFactory.getLogger(CartService.class);


    @GrpcClient("inventory-grpc-server")
    private CartServiceGrpc.CartServiceBlockingStub cartServiceBlockingStub;

    public CartResponse getCart(String userId) {
        LOGGER.info("getCart for userId: {}", userId);
        CartRequest request = CartRequest.newBuilder().setUserId(userId).build();
        return cartServiceBlockingStub.getCart(request);
    }
}
