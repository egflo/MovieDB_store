package com.user_service.models;

import com.user_service.DTO.ReviewRequest;
import lombok.Getter;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Document(collection = "reviews")
public class Review {
    @Id
    @Getter
    @Setter
    private ObjectId id;

    @Getter
    @Setter
    @Field("movie_id")
    private ObjectId movieId;

    @Field("user_id")
    @Getter
    @Setter
    private  String userId;

    @Getter
    @Setter
    private  Boolean love;

    @Getter
    @Setter
    private Integer rating;

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
    private UserMeta user;

    @Getter
    @Setter
    private Movie movie;

    @Getter
    @Setter
    private Integer likes;

    @Getter
    @Setter
    private Integer dislikes;

    public Review() {
        this.date = new Date();
        this.likes = 0;
        this.dislikes = 0;
    }

    public Review(Review review) {
        this.id = review.id;
        this.movieId = review.movieId;
        this.userId = review.userId;
        this.love = review.love;
        this.rating = review.rating;
        this.title = review.title;
        this.content = review.content;
        this.date = review.date;
        this.user = review.user;
        this.movie = review.movie;
        this.likes = review.likes;
        this.dislikes = review.dislikes;
    }

    public Review(ReviewRequest request) {
        this.movieId = new ObjectId(request.movieId());
        this.userId = request.getUserId();
        this.rating = request.rating();
        this.title = request.title();
        this.content = request.content();
        this.love = request.love();
        this.date = new Date();
        this.likes = 0;
        this.dislikes = 0;
    }
}
