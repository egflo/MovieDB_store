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
@Document(collection = "metacritic_critic_reviews")
public class MetacriticCriticReview {

    @Id
    private String id;

    String review_id;

    @Field("movie_id")
    String movieId;

    /** Missing on about half of them. */
    Date creation_date;

    String critic_name;

    String publication_name;

    /** 0-100. */
    Integer score;

    /** POSITIVE, MIXED or NEGATIVE. */
    String sentiment;

    String text;
}
