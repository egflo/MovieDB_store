package com.user_service.models;

import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;


@Setter
@NoArgsConstructor
public class ReviewMovie {

    @Field("id")
    String id;

    String title;

    Integer year;

    @Field("movie_id")
    String movieId;

    String poster;

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getMovieId() {
        return movieId;
    }

    public Integer getYear() {
        return year;
    }

    public String getPoster() {
        return poster;
    }
}
