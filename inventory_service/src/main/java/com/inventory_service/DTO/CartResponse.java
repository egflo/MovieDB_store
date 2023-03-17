package com.inventory_service.DTO;


import com.inventory_service.model.Cart;

public class CartResponse extends CartDTO {
    Double price;
    MovieDTO movie;


    public CartResponse(Cart cart) {
        super(cart);
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public MovieDTO getMovie() {
        return movie;
    }

    public void setMovie(MovieDTO movie) {
        this.movie = movie;
    }


}
