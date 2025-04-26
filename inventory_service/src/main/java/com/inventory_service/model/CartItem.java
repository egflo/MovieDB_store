package com.inventory_service.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.proto.grpc.MovieResponse;


@Entity
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String itemId;
    private String itemName;
    private String itemDescription;
    private String itemImageUrl;
    private int quantity;
    private long price;

    @JsonIgnore
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;


    public CartItem() {
    }

    public CartItem(String itemId, String itemName, String itemDescription, String itemImageUrl, int quantity, long price) {
        this.itemId = itemId;
        this.itemName = itemName;
        this.itemDescription = itemDescription;
        this.itemImageUrl = itemImageUrl;
        this.quantity = quantity;
        this.price = price; //in cents
    }

    public CartItem(Integer id, String itemId, String itemName, String itemDescription, String itemImageUrl, int quantity, long price) {
        this.id = id;
        this.itemId = itemId;
        this.itemName = itemName;
        this.itemDescription = itemDescription;
        this.itemImageUrl = itemImageUrl;
        this.quantity = quantity;
        this.price = price; //in cents
    }

    public CartItem(MovieResponse movieRespons, int quantity, long price) {
        this.itemId = movieRespons.getId();
        this.itemName = movieRespons.getTitle();
        this.itemDescription = movieRespons.getSku();
        this.itemImageUrl = movieRespons.getPoster();
        this.quantity = quantity;
        this.price = price; //in cents
    }

    public Integer getId() {
        return id;
    }

    public String getItemId() {
        return itemId;
    }

    public String getItemName() {
        return itemName;
    }

    public String getItemDescription() {
        return itemDescription;
    }

    public String getItemImageUrl() {
        return itemImageUrl;
    }

    public int getQuantity() {
        return quantity;
    }

    public long getPrice() {
        return price;
    }

    //Setters
    public void setId(Integer id) {
        this.id = id;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }
    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public void setItemDescription(String itemDescription) {
        this.itemDescription = itemDescription;
    }

    public void setItemImageUrl(String itemImageUrl) {
        this.itemImageUrl = itemImageUrl;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public void setPrice(long price) {
        this.price = price;
    }


    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    @Override
    public String toString() {
        return "CartItem{" +
                "id='" + id + '\'' +
                ", itemId='" + itemId + '\'' +
                ", itemName='" + itemName + '\'' +
                ", itemDescription='" + itemDescription + '\'' +
                ", itemImageUrl='" + itemImageUrl + '\'' +
                ", quantity='" + quantity + '\'' +
                ", price=" + price +
                '}';
    }
}
