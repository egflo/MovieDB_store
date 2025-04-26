package com.user_service.DTO;

import com.user_service.models.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
public class ReviewDTO {

    private  String id;

    private String movieId;

    private String userId;

    private Integer rating;

    private String title;

    private String content;

    private UserMeta user;

    private Movie movie;

    private Date date;

    private boolean love;

    private Integer likes;

    private Integer dislikes;

    //optional field might be null
    private SentimentDTO sentiment;

    public ReviewDTO(Review review) {
        this.id = review.getId().toString();
        this.movieId = review.getMovieId().toString();
        this.userId = review.getUserId();
        this.rating = review.getRating();
        this.title = review.getTitle();
        this.content = review.getContent();
        this.user = review.getUser();
        this.movie = review.getMovie();
        this.date = review.getDate();
        this.love = review.getLove();
        this.likes = review.getLikes();
        this.dislikes = review.getDislikes();
    }

    public void setSentiment(Sentiment sentiment) {
        this.sentiment = new SentimentDTO(sentiment);
    }
}
