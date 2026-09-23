package com.movie_service.grpc;


//import com.proto.grpc.ItemRequest;

import net.devh.boot.grpc.client.inject.GrpcClient;
import org.proto.grpc.ItemRequest;
import org.proto.grpc.ItemResponse;
import org.proto.grpc.ItemServiceGrpc;
import org.proto.grpc.ItemsRequest;
import org.proto.grpc.ItemsResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class ItemService {

    static final org.slf4j.Logger LOGGER = org.slf4j.LoggerFactory.getLogger(ItemService.class);

    @Value("${grpc.server.port}")
    private int grpcServerPort;

    //Blocking stub - synchronous call waits for the response
    @GrpcClient("inventory-grpc-server")
    private ItemServiceGrpc.ItemServiceBlockingStub itemServiceBlockingStub;

    public ItemResponse getItem(String id) {

        LOGGER.info("getItem");
        //itemServiceBlockingStub = ItemServiceGrpc.newBlockingStub(itemServiceBlockingStub.getChannel());
        ItemRequest request = ItemRequest.newBuilder().setId(id).build();
        LOGGER.info("request: {}", request);
        return itemServiceBlockingStub.getItem(request);
    }

    /** Items for many ids in one call. Ids with no product are left out. */
    public ItemsResponse getItems(List<String> ids) {
        return itemServiceBlockingStub
                .withDeadlineAfter(30, TimeUnit.SECONDS)
                .getItems(ItemsRequest.newBuilder().addAllIds(ids).build());
    }

    public ItemResponse getItemBySku(String sku) {
        LOGGER.info("getItemBySku");
        ItemRequest request = ItemRequest.newBuilder().setId(sku).build();
        LOGGER.info("request: {}", request);
        return itemServiceBlockingStub.getItemBySku(request);
    }
}
