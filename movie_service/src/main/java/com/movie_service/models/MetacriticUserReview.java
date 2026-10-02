package com.movie_service.models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "metacritic_user_reviews")
public class MetacriticUserReview {

    @Id
    private String id;

    String reviewId;

    @Field("movie_id")
    String movieId;

    String title;

    String text;

    /** 0-10. */
    Integer rating;

    String sentiment;

    Date date;

    ReviewUser user;
}
