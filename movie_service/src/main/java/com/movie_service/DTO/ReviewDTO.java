package com.movie_service.DTO;


import com.movie_service.models.Review;
import com.movie_service.models.Status;
import com.movie_service.models.User;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
@NoArgsConstructor
public class ReviewDTO {
    private String id;

    private String movieId;

    private Integer rating;

    private String sentiment;

    private String title;

    private String text;

    private User user;

    private String date;

    private Status status;

    public ReviewDTO(Review review) {
        this.id = review.getId();
        this.movieId = review.getMovieId();
        this.rating = review.getRating();
        this.sentiment = review.getSentiment();
        this.title = review.getTitle();
        this.text = review.getText();
        this.user = review.getUser();
        this.date = review.getDate();
        this.status = Status.NONE;
    }

    public ReviewDTO(String id, String movieId, Integer rating, String sentiment, String title, String text, User user, String date) {
        this.id = id;
        this.movieId = movieId;
        this.rating = rating;
        this.sentiment = sentiment;
        this.title = title;
        this.text = text;
        this.user = user;
        this.date = date;
        this.status = Status.NONE;
    }
}
