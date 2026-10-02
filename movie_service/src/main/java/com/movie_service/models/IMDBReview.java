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
@Document(collection = "imdb_reviews")
public class IMDBReview {

    @Id
    private String id;

    String reviewId;

    @Field("movie_id")
    String movieId;

    String title;

    String text;

    /** 1-10. */
    Integer rating;

    String sentiment;

    Date date;

    String permalink;

    /** "found helpful" votes; missing on about half of them. */
    Helpful helpful;

    ReviewUser user;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Helpful {
        Integer found;
        Integer total;
    }
}
