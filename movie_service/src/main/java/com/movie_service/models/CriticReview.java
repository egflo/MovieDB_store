package com.movie_service.models;


import lombok.Data;
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
@Document(collection = "critic_reviews")
public class CriticReview {

    @Id
    private String id;

    Date creation_date;

    String critic_name;

    Integer isTopCritic;

    @Field("movie_id")
    String movieId;

    String publication_name;

    Integer review_id;

    String review_state;

    String review_url;

    String text;

    String score;

    String sentiment;


    public CriticReview(String id, Date creation_date, String critic_name, Integer isTopCritic, String movieId, String publication_name, Integer review_id, String review_state, String review_url, String text, String score, String sentiment) {
        this.id = id;
        this.creation_date = creation_date;
        this.critic_name = critic_name;
        this.isTopCritic = isTopCritic;
        this.movieId = movieId;
        this.publication_name = publication_name;
        this.review_id = review_id;
        this.review_state = review_state;
        this.review_url = review_url;
        this.text = text;
        this.score = score;
        this.sentiment = sentiment;
    }

    public Boolean getIsTopCritic() {
        return isTopCritic == 1;
    }

}
