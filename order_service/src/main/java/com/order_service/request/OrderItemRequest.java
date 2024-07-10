package com.order_service.request;

public class OrderItemRequest {
    private String itemId;
    private int quantity;
    private Long price;
    private String name;
    private String imageUrl;
    private String description;
    private String sku;


    public OrderItemRequest() {
    }

    public OrderItemRequest(String productId, int quantity, Long price, String name, String imageUrl, String description, String SKU,
                            String itemId) {
        this.itemId = productId;
        this.quantity = quantity;
        this.price = price;
        this.name = name;
        this.imageUrl = imageUrl;
        this.description = description;
        this.sku = SKU;
        this.itemId = itemId;
    }



    public String getItemId() {
        return itemId;
    }

    public void setItemId(String productId) {
        this.itemId = productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Long getPrice() {
        return price;
    }

    public void setPrice(Long price) {
        this.price = price;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSKU() {
        return sku;
    }

    public void setSKU(String SKU) {
        this.sku = SKU;
    }

    @Override
    public String toString() {
        return "OrderItemRequest{" +
                "itemId='" + itemId + '\'' +
                ", quantity=" + quantity +
                ", price=" + price +
                ", name='" + name + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", description='" + description + '\'' +
                ", SKU='" + sku + '\'' +
                '}';
    }

}
