package com.user_service.DTO;

import com.user_service.models.Comment;
import com.user_service.models.Movie;
import com.user_service.models.Sentiment;
import com.user_service.models.UserMeta;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Getter
@Setter
public class CommentDTO {
    String id;

    String text;

    String userId;

    String movieId;

    String reviewId;

    Date date;

    Integer likes;

    UserMeta user;

    Movie movie;

    SentimentDTO sentiment;

    public CommentDTO(Comment comment) {
        this.id = comment.getId().toString();
        this.text = comment.getText();
        this.userId = comment.getUserId();
        this.movieId = comment.getMovieId().toString();
        this.reviewId = comment.getReviewId().toString();
        this.date = comment.getDate();
        this.likes = comment.getLikes();
        this.user = comment.getUser();
        this.movie = comment.getMovie();
    }

    public void setSentiment(Sentiment sentiment) {
        this.sentiment = new SentimentDTO(sentiment);
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
