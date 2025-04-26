package com.order_service.model;

import lombok.Setter;
import org.proto.grpc.CartResponse;

import java.util.Date;
import java.util.List;

import lombok.Getter;

@Getter
@Setter
public class Cart {
    private long id;
    private String userId;
    private Date created;
    private String currency;
    private List<CartItem> items;

    public Cart() {
    }

    public Cart(CartResponse cartResponse) {
        this.id = cartResponse.getId();
        this.userId = cartResponse.getUserId();
        this.created = new Date(cartResponse.getCreated());
        this.currency = cartResponse.getCurrency();
        this.items = cartResponse.getItemsList().stream()
                .map(CartItem::new)
                .toList();
    }


}
