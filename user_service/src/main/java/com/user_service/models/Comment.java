package com.user_service.models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
@Getter
@Setter
@Document(collection = "comments")
public class Comment {
    @Id
    ObjectId id;

    String text;

    @Field("user_id")
    String userId;

    @Field("movie_id")
    ObjectId movieId;

    @Field("review")
    ObjectId reviewId;

    @Field("parent")
    ObjectId parent; // parent comment id

    Date date;

    Integer likes;

    @Getter
    UserMeta user;

    @Getter
    Movie movie;

    public Comment() {
        this.likes = 0;
        this.date = new Date();
    }

    public Comment(ObjectId id, String text, String userId, ObjectId movieId, ObjectId reviewId, Date date, Integer likes, UserMeta user, Movie movie) {
        this.id = id;
        this.text = text;
        this.userId = userId;
        this.movieId = movieId;
        this.reviewId = reviewId;
        this.date = date;
        this.likes = likes;
        this.user = user;
        this.movie = movie;
    }

    public ObjectId getId() {
        return this.id;
    }

    public ObjectId getMovieId() {
        return this.movieId;
    }

    public ObjectId getReviewId() {
        return this.reviewId;
    }

    public String getText() {
        return  this.text;
    }

    public Integer getLikes () {
        return  this.likes;
    }

    public Date getDate() {
        return this.date;
    }

    @Override
    public String toString() {
        return "Comment{" +
                "id=" + id +
                ", text='" + text + '\'' +
                ", userId='" + userId + '\'' +
                ", movieId=" + movieId +
                ", reviewId=" + reviewId +
                ", date=" + date +
                ", likes=" + likes +
                ", user=" + user +
                ", movie=" + movie +
                '}';
    }

}
