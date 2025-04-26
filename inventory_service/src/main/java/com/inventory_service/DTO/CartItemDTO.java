package com.inventory_service.DTO;

import com.inventory_service.model.CartItem;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemDTO {
    private Integer id;
    private String itemId;
    private String itemName;
    private String itemDescription;
    private String itemImageUrl;
    private int quantity;
    private long price;

    public CartItemDTO(Integer id, String itemId, String itemName, String itemDescription, String itemImageUrl, int quantity, long price) {
        this.id = id;
        this.itemId = itemId;
        this.itemName = itemName;
        this.itemDescription = itemDescription;
        this.itemImageUrl = itemImageUrl;
        this.quantity = quantity;
        this.price = price; //in cents
    }

    public CartItemDTO(CartItem cartItem) {
        this.id = cartItem.getId();
        this.itemId = cartItem.getItemId();
        this.itemName = cartItem.getItemName();
        this.itemDescription = cartItem.getItemDescription();
        this.itemImageUrl = cartItem.getItemImageUrl();
        this.quantity = cartItem.getQuantity();
        this.price = cartItem.getPrice();
    }

    @Override
    public String toString() {
        return "CartItemDTO{" +
                "id=" + id +
                ", cartId='" + itemId + '\'' +
                ", itemName='" + itemName + '\'' +
                ", itemDescription='" + itemDescription + '\'' +
                ", itemImageUrl='" + itemImageUrl + '\'' +
                ", quantity='" + quantity + '\'' +
                ", price=" + price +
                '}';
    }
}
