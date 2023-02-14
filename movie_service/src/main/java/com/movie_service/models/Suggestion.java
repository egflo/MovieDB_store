package com.movie_service.models;


import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "suggestions")
public class Suggestion {
    @Id
    private ObjectId id;

    private String movieId;


    @Field("sug_movieId")
    private String sugMovieId;




    public Suggestion() {
    }

    public Suggestion(ObjectId id, String movieId, String sugMovieId) {
        this.id = id;
        this.movieId = movieId;
        this.sugMovieId = sugMovieId;
    }

    public String getId() {
        return id.toHexString();
    }

    public void setId(String id) {
        this.id = new ObjectId(id);
    }

    public String getMovieId() {
        return movieId;
    }

    public void setMovieId(String movieId) {
        this.movieId = movieId;
    }

    public String getSugMovieId() {
        return sugMovieId;
    }

    public void setSugMovieId(String sugMovieId) {
        this.sugMovieId = sugMovieId;
    }
}
