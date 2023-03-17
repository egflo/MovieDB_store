package com.movie_service.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.movie_service.models.Bookmark;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BookmarkDTO {
    String id;
    String userId;
    String created;

    String movieId;


    public BookmarkDTO(Bookmark bookmark) {
        this.id = bookmark.getId();
        this.userId = bookmark.getUserId();
        this.created = bookmark.getCreated().toString();
        this.movieId = bookmark.getMovie().getMovieId();
    }

    public BookmarkDTO(String id, String userId, String movieId, String created) {
        this.id = id;
        this.userId = userId;
        this.created = created;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCreated() {
        return created;
    }

    public void setCreated(String created) {
        this.created = created;
    }

    public String getMovieId() {
        return movieId;
    }

    public void setMovieId(String movieId) {
        this.movieId = movieId;
    }
}
