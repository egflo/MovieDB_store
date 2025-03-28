package com.user_service.models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
@Setter
@NoArgsConstructor
@Document(collection = "user_review_comments")
public class Comment {
    @Id
    ObjectId id;
    String comment;

    @Field("user_id")
    String user_id;

    @Field("movie_id")
    ObjectId movieId;

    @Field("review_id")
    ObjectId reviewId;

    Date date;

    Integer likes;

    @Getter
    ReviewUser user;

    @Getter
    ReviewMovie movie;

    public String getId() {
        return this.id.toString();
    }

    public String getMovieId() {
        return this.movieId.toString();
    }

    public String getReviewId() {
        return this.reviewId.toString();
    }

    public String getComment() {
        return  this.comment;
    }

    public Integer getLikes () {
        return  this.likes;
    }

    public Date getDate() {
        return this.date;
    }


}
