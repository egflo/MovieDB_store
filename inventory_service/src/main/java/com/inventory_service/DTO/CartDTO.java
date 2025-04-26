package com.inventory_service.DTO;

import com.inventory_service.model.Cart;
import org.proto.grpc.MovieResponse;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Set;

@Transactional // This annotation is used to indicate that the method should be executed within a transaction.
public class CartDTO {
    Integer id;
    String userId;
    Date created;
    Date updated;
    List<CartItemDTO> items;

    public CartDTO(Cart cart) {
        this.id = cart.getId();
        this.userId = cart.getUserId();
        this.created = cart.getCreated();
        this.updated = cart.getUpdated();
        this.items = cart.getCartItems().stream()
                .map(CartItemDTO::new)
                .toList();
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

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public Date getUpdated() {
        return updated;
    }

    public void setUpdated(Date updated) {
        this.updated = updated;
    }

    public List<CartItemDTO> getItems() {
        return items;
    }

    public void setItems(List<CartItemDTO> items) {
        this.items = items;
    }

    @Override
    public String toString() {
        return "CartDTO{" +
                "id=" + id +
                ", userId='" + userId + '\'' +
                ", created=" + created +
                ", updated=" + updated +
                ", items=" + items +
                '}';
    }
}
