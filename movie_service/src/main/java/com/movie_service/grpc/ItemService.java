package com.movie_service.grpc;


//import com.proto.grpc.ItemRequest;

import net.devh.boot.grpc.client.inject.GrpcClient;
import org.proto.grpc.ItemRequest;
import org.proto.grpc.ItemResponse;
import org.proto.grpc.ItemServiceGrpc;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ItemService {

    @Value("${grpc.server.port}")
    private int grpcServerPort;

    //Blocking stub - synchronous call waits for the response
    @GrpcClient("inventory-grpc-server")
    private ItemServiceGrpc.ItemServiceBlockingStub itemServiceBlockingStub;

    public ItemResponse getItem(String id) {

        //itemServiceBlockingStub = ItemServiceGrpc.newBlockingStub(itemServiceBlockingStub.getChannel());

        ItemRequest request = ItemRequest.newBuilder().setId(id).build();
        return itemServiceBlockingStub.getItem(request);
    }
}
