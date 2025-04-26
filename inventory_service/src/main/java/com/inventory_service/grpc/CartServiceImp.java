package com.inventory_service.grpc;


import com.inventory_service.DTO.CartDTO;
import com.inventory_service.exception.IdNotFoundException;
import com.inventory_service.model.Cart;
import com.inventory_service.repository.CartRepository;
import com.inventory_service.repository.ItemRepository;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.proto.grpc.CartServiceGrpc;
import org.proto.grpc.CartItem;
import org.proto.grpc.CartResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;


@Transactional
@GrpcService
public class CartServiceImp extends CartServiceGrpc.CartServiceImplBase {

    final Logger LOGGER = LoggerFactory.getLogger(CartServiceImp.class);

    CartRepository cartRepository;
    ItemRepository itemRepository;

    @Autowired
    public CartServiceImp(CartRepository cartRepository, ItemRepository itemRepository
            , MovieService movieService) {
        this.cartRepository = cartRepository;
        this.itemRepository = itemRepository;
    }

    @Override
    public void getCart(org.proto.grpc.CartRequest request, StreamObserver<CartResponse> responseObserver) {

        Cart cart =  cartRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new IdNotFoundException("Cart id not found"));

        List<CartItem> items = new ArrayList<>();
        cart.getCartItems().forEach(item -> {
            CartItem cartItem = CartItem.newBuilder()
                    .setId(item.getId())
                    .setCartId(cart.getId())
                    .setItemId(item.getItemId())
                    .setQuantity(item.getQuantity())
                    .setPrice((int) item.getPrice())
                    .setName(item.getItemName())
                    .setDescription(item.getItemDescription())
                    .setImage(item.getItemImageUrl())
                    .build();
            items.add(cartItem);
        });

        CartResponse response = CartResponse.newBuilder()
                .setId(cart.getId())
                .setUserId(cart.getUserId())
                .setCreated(cart.getCreated().getTime())
                .setUpdated(cart.getUpdated().getTime())
                .setCurrency("USD")
                .addAllItems(items)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
