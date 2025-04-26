package com.inventory_service.grpc;



import com.inventory_service.model.Product;
import com.inventory_service.model.Status;
import org.proto.grpc.*;

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
        Optional<Product> item = itemRepository.findItemById(id);
        ItemResponse response = ItemResponse.newBuilder()
                .setId(item.get().getId())
                .setSku(item.get().getSKU())
                .setPrice(item.get().getPrice())
                .setQuantity(item.get().getQuantity())
                .setCurrency(item.get().getCurrency())
                .setType(1)
                .setStatus(item.get().getStatus().toString())
                .setCreated(item.get().getCreated().getTime())
                .setUpdated(item.get().getUpdated().getTime())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getItemBySku(ItemRequest request, StreamObserver<ItemResponse> responseObserver) {
        String sku = request.getId();
        Optional<Product> item = itemRepository.findItemBySKU(sku);
        ItemResponse response = ItemResponse.newBuilder()
                .setId(item.get().getId())
                .setSku(item.get().getSKU())
                .setPrice(item.get().getPrice())
                .setQuantity(item.get().getQuantity())
                .setCurrency(item.get().getCurrency())
                .setType(1)
                .setStatus(item.get().getStatus().toString())
                .setCreated(item.get().getCreated().getTime())
                .setUpdated(item.get().getUpdated().getTime())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getItems(ItemsRequest request, StreamObserver<ItemsResponse> responseObserver) {
        ItemsResponse.Builder response = ItemsResponse.newBuilder();
        for (String id : request.getIdsList()) {
            Optional<Product> item = itemRepository.findItemById(id);
            ItemResponse itemResponse = ItemResponse.newBuilder()
                    .setId(item.get().getId())
                    .setSku(item.get().getSKU())
                    .setPrice(item.get().getPrice())
                    .setQuantity(item.get().getQuantity())
                    .setCurrency(item.get().getCurrency())
                    .setType(1)
                    .setStatus(item.get().getStatus().toString())
                    .setCreated(item.get().getCreated().getTime())
                    .setUpdated(item.get().getUpdated().getTime())
                    .build();
            response.addItems(itemResponse);
        }
        responseObserver.onNext(response.build());
        responseObserver.onCompleted();
    }

    @Override
    public void getItemsBySku(ItemsRequest request, StreamObserver<ItemsResponse> responseObserver) {
        ItemsResponse.Builder response = ItemsResponse.newBuilder();
        for (String sku : request.getIdsList()) {
            Optional<Product> item = itemRepository.findItemBySKU(sku);
            ItemResponse itemResponse = ItemResponse.newBuilder()
                    .setId(item.get().getId())
                    .setSku(item.get().getSKU())
                    .setPrice(item.get().getPrice())
                    .setQuantity(item.get().getQuantity())
                    .setCurrency(item.get().getCurrency())
                    .setType(1)
                    .setStatus(item.get().getStatus().toString())
                    .setCreated(item.get().getCreated().getTime())
                    .setUpdated(item.get().getUpdated().getTime())
                    .build();
            response.addItems(itemResponse);
        }
        responseObserver.onNext(response.build());
        responseObserver.onCompleted();
    }

    @Override
    public void createItem(ItemRequest request, StreamObserver<ItemResponse> responseObserver) {
        Product item = new Product();
        item.setSKU(request.getSku());
        item.setPrice((int) request.getPrice());
        item.setQuantity(request.getQuantity());
        item.setCurrency(request.getCurrency());
        item.setStatus(Status.IN_STOCK);
        item.setCreated(new java.util.Date());
        item.setUpdated(new java.util.Date());
        itemRepository.save(item);

        ItemResponse response = ItemResponse.newBuilder()
                .setId(item.getId())
                .setSku(item.getSKU())
                .setPrice(item.getPrice())
                .setQuantity(item.getQuantity())
                .setCurrency(item.getCurrency())
                .setType(1)
                .setStatus(item.getStatus().toString())
                .setCreated(item.getCreated().getTime())
                .setUpdated(item.getUpdated().getTime())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void deleteItem(ItemRequest request, StreamObserver<ItemResponse> responseObserver) {
        String id = request.getId();
        Optional<Product> item = itemRepository.findItemById(id);
        if (item.isPresent()) {
            itemRepository.delete(item.get());
            ItemResponse response = ItemResponse.newBuilder()
                    .setId(item.get().getId())
                    .setSku(item.get().getSKU())
                    .setPrice(item.get().getPrice())
                    .setQuantity(item.get().getQuantity())
                    .setCurrency(item.get().getCurrency())
                    .setType(1)
                    .setStatus(item.get().getStatus().toString())
                    .setCreated(item.get().getCreated().getTime())
                    .setUpdated(item.get().getUpdated().getTime())
                    .build();

            responseObserver.onNext(response);
        } else {
            responseObserver.onError(new RuntimeException("Item not found"));
        }
        responseObserver.onCompleted();
    }


}
