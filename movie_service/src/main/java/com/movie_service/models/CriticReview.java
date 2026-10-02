package com.movie_service.models;


import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

/**
 * A Rotten Tomatoes critic review. The collection was "critic_reviews" until
 * the other review sources arrived; the class keeps its name because
 * /critic/movie/{id} still returns it as is.
 */
@Getter
@Setter
@NoArgsConstructor
@Document(collection = "rotten_tomatoes_critic_reviews")
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

    /** The score on a 0-100 scale; null when the critic gave none (about 30%). */
    Double scoreNormalized;


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
        return isTopCritic != null && isTopCritic == 1;
    }

}
