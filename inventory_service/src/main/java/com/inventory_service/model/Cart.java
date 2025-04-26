package com.inventory_service.model;

import jakarta.persistence.*;

import java.util.*;

@Entity
@Table(name="cart")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "userId")
    private String userId;

    // This will set the created and updated time automatically when we create a new object
    @Temporal(TemporalType.TIMESTAMP)
	@PrePersist
	protected void onCreate() {
		created = updated = new Date();
	}

	@Temporal(TemporalType.TIMESTAMP)
	@PreUpdate
	protected void onUpdate() {
		updated = new Date();
	}

    @Column(name = "created")
    private Date created;

    @Column(name = "updated")
    private Date updated;

    @OneToMany(mappedBy="cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CartItem> items = new HashSet<>();

    public Cart() {
        this.created = new Date();
        this.updated = new Date();
        this.items = new HashSet<>();
    }

    public Cart(String userId, Date created, Date updated) {
        this.userId = userId;
        this.created = created;
        this.updated = updated;
        this.items = new HashSet<>();
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

    public Set<CartItem> getCartItems() {
        return items;
    }

    public void addCartItem(CartItem cartItem) {
        this.items.add(cartItem);
        cartItem.setCart(this);
    }

    public void removeCartItem(CartItem cartItem) {
        this.items.remove(cartItem);
    }

    @Override
    public String toString() {
        return "Cart{" +
                "id=" + id +
                ", userId='" + userId + '\'' +
                ", created=" + created +
                ", updated=" + updated +
                ", cartItems=" + items +
                '}';
    }
}