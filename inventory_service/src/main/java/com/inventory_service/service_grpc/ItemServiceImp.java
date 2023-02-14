package com.inventory_service.service_grpc;



import com.inventory_service.model.Item;
import org.proto.grpc.ItemServiceGrpc;
import org.proto.grpc.ItemRequest;
import org.proto.grpc.ItemResponse;

import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;

import com.inventory_service.service.ItemService;
import com.inventory_service.repository.ItemRepository;

import java.util.Optional;


@GrpcService
public class ItemServiceImp extends ItemServiceGrpc.ItemServiceImplBase {

    ItemService itemService;

    ItemRepository itemRepository;

    @Autowired
    public ItemServiceImp(ItemService itemService, ItemRepository itemRepository) {
        this.itemService = itemService;
        this.itemRepository = itemRepository;
    }

    @Override
    public void getItem(ItemRequest request, StreamObserver<ItemResponse> responseObserver) {

        String id  = request.getId();
        Optional<Item> item = itemRepository.findItemById(id);
        ItemResponse response = ItemResponse.newBuilder()
                .setId(item.get().getId())
                .setSku(item.get().getSKU())
                .setPrice(item.get().getPrice())
                .setQuantity(item.get().getQuantity())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }


}
