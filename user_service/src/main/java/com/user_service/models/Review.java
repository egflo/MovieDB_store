package com.user_service.models;

import lombok.Getter;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Document(collection = "user_reviews")
public class Review {
    @Id
    @Getter
    @Setter
    private ObjectId id;

    @Getter
    @Setter
    @Field("movie_id")
    private String movieId;

    @Field("user_id")
    private  String userId;
    @Getter
    @Setter
    private Integer rating;

    @Getter
    @Setter
    private Integer sentiment;

    @Getter
    @Setter
    private String title;

    @Getter
    @Setter
    private String content;

    @Getter
    @Setter
    private Date date;

    @Getter
    @Setter
    private  Boolean love;

    @Getter
    @Setter
    private ReviewUser user;

    @Getter
    @Setter
    private ReviewMovie movie;

    public Review() {

    }

    public Review(ObjectId id, String movieId, Integer rating, Integer sentiment, String title, String content, ReviewUser user, ReviewMovie movie, Date date, boolean love)
    {
        this.id = id;
        this.movieId = movieId;
        this.rating = rating;
        this.sentiment = sentiment;
        this.title = title;
        this.content = content;
        this.user = user;
        this.date = date;
        this.movie = movie;
        this.love = love;
    }



}
