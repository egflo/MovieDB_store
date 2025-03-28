package com.inventory_service.service_grpc;


import com.inventory_service.model.Cart;
import com.inventory_service.model.Item;
import com.inventory_service.repository.CartRepository;
import com.inventory_service.repository.ItemRepository;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.proto.grpc.CartItem;
import org.proto.grpc.CartResponse;
import org.proto.grpc.CartServiceGrpc;
import org.springframework.beans.factory.annotation.Autowired;
import org.proto.grpc.MovieResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@GrpcService
public class CartServiceImp extends CartServiceGrpc.CartServiceImplBase {

    CartRepository cartRepository;

    ItemRepository itemRepository;

    MovieService movieService;

    @Autowired
    public CartServiceImp(CartRepository cartRepository, ItemRepository itemRepository
            , MovieService movieService) {
        this.cartRepository = cartRepository;
        this.itemRepository = itemRepository;
        this.movieService = movieService;
    }

    @Override
    public void getCart(org.proto.grpc.CartRequest request, StreamObserver<CartResponse> responseObserver) {

        String userId = request.getUserId();
        List<Cart> carts = cartRepository.findAllByUserId(userId);
        List<CartItem> items = new ArrayList<>();
        for(Cart cart : carts) {

            MovieResponse movieResponse = movieService.getMovie(cart.getItemId());
            Optional<Item> itemOptional = itemRepository.findItemById(cart.getItemId());
            if(itemOptional.isEmpty()) {
                continue;
            }

            CartItem item = CartItem.newBuilder()
                    .setId(cart.getId())
                    .setUserId(cart.getUserId())
                    .setItemId(cart.getItemId())
                    .setQuantity(cart.getQuantity())
                    .setPrice(itemOptional.get().getPrice())
                    .setCurrency(itemOptional.get().getCurrency())
                    .setName(movieResponse.getTitle())
                    .setDescription(movieResponse.getTitle())
                    .setImage(movieResponse.getPoster())
                    .setSku(movieResponse.getSku())
                    .build();

            items.add(item);
        }

        org.proto.grpc.CartResponse response = org.proto.grpc.CartResponse.newBuilder()
                .addAllItems(items)
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }



}
