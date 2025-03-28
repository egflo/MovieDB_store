package com.user_service.DTO;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
class ReviewUserDTO {
    String id;

    String email;

    String displayName;

}

class ReviewMovieDTO {

    String id;

    String title;

    Integer year;

    String movieId;

    String poster;
}


@Getter
@Setter
@NoArgsConstructor
public class ReviewDTO {

    private  String id;

    private String movieId;

    private Integer rating;

    private Integer sentiment;

    private String title;

    private String content;

    private ReviewUser user;

    private ReviewMovie movie;

    private Date date;

    private boolean love;

    private Integer likes;

    private Integer dislikes;

    private SentimentDTO status;

    public ReviewDTO(UserReview review) {
        this.id = review.getId().toString();
        this.movieId = review.getMovieId();
        this.rating = review.getRating();
        this.sentiment = review.getSentiment();
        this.title = review.getTitle();
        this.content = review.getContent();
        this.date = review.getDate();
        this.movie = review.getMovie();
        this.user = review.getUser();
        this.love = review.getLove();
    }

}
