package com.inventory_service.DTO;


public class CartResponse extends CartDTO {
    String price;
    MovieDTO movie;

    public CartResponse() {
    }

    public CartResponse(Integer id, String userId, String itemId, Integer quantity, String created, MovieDTO movie) {
        super(id, userId, itemId, quantity, created);
        this.movie = movie;
    }


    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public void setMovie(MovieDTO movie) {
        this.movie = movie;
    }

    public MovieDTO getMovie() {
        return movie;
    }


}
