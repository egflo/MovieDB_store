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
@Document(collection = "letterboxd_reviews")
public class LetterboxdReview {

    @Id
    private String id;

    Integer sourceId;

    @Field("movie_id")
    String movieId;

    String text;

    /** 1-10 (half stars doubled); null on a few. */
    Integer rating;

    Integer likes;

    /** The reviewer gave the film a heart. */
    Boolean liked;

    Date date;

    ReviewUser user;
}
