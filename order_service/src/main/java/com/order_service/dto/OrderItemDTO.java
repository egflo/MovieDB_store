package com.order_service.dto;


import com.order_service.model.OrderItem;
import org.proto.grpc.MovieResponse;

class Product {
    private String id;

    private String sku;

    private String photo;

    private String name;

    private String description;

    Product(MovieResponse movieResponse) {
        this.id = movieResponse.getId();
        this.sku = movieResponse.getId();
        this.photo = movieResponse.getPoster();
        this.name = movieResponse.getTitle();
        this.description = String.format("Released in %s, %s", movieResponse.getYear());
    }
}

public class OrderItemDTO {
    private Long id;
    private String  itemId;
    private Integer quantity;
    private Double price;

    private Product product;

    public OrderItemDTO(OrderItem orderItem, MovieResponse movieResponse) {
        this.id = orderItem.getId();
        this.itemId = orderItem.getItemId();
        this.quantity = orderItem.getQuantity();
        this.price = orderItem.getPrice();
        this.product = new Product(movieResponse);
    }


    public OrderItemDTO(Long id, String itemId, Integer quantity, Double price, Product product) {
        this.id = id;
        this.itemId = itemId;
        this.quantity = quantity;
        this.price = price;
        this.product = product;
    }
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}
