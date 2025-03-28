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
@Setter
@NoArgsConstructor
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

    Date date;

    Integer likes;

    @Getter
    UserMeta user;

    @Getter
    Movie movie;

    public String getId() {
        return this.id.toString();
    }

    public String getMovieId() {
        return this.movieId.toString();
    }

    public String getReviewId() {
        return this.reviewId.toString();
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
