package com.inventory_service.DTO;

public class CartDTO {
    Integer id;
    String userId;
    String itemId;
    Integer quantity;

    public CartDTO() {
    }

    public CartDTO(Integer id, String userId, String itemId, Integer quantity, String created) {
        this.id = id;
        this.userId = userId;
        this.itemId = itemId;
        this.quantity = quantity;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

    @Override
    public String toString() {
        return "CartDTO{" +
                "id=" + id + ", userId='" + userId + '\'' + ", itemId='" + itemId + '\'' + ", quantity='" + quantity + '\'' + '}';
    }
}
