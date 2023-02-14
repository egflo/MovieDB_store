package com.movie_service.models;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;


@Document(collection = "reviews")
public class Review {

    @Id
    private ObjectId id;


    @Field("movie_id")
    private String movieId;

    private Integer rating;

    private String sentiment;

    private String title;

    private String text;

    private User user;

    private String date;

    public Review() {
    }

    public Review(ObjectId id, String movieId, Integer rating, String sentiment, String title, String text, User user, String date) {
        this.id = id;
        this.movieId = movieId;
        this.rating = rating;
        this.sentiment = sentiment;
        this.title = title;
        this.text = text;
        this.user = user;
        this.date = date;
    }

    public String getId() {
        return id.toHexString();
    }

    public void setId(String id) {
        this.id = new ObjectId(id);
    }

    public String getMovieId() {
        return movieId;
    }

    public void setMovieId(String movieId) {
        this.movieId = movieId;
    }

    public Integer getRating() {
        return rating;
    }


    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getSentiment() {
        return sentiment;
    }

    public void setSentiment(String sentiment) {
        this.sentiment = sentiment;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

}
