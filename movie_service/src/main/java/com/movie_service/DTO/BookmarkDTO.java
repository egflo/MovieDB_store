package com.movie_service.DTO;

public class BookmarkDTO {
    String id;
    String userId;
    String movieId;
    String created;

    public BookmarkDTO(String id, String userId, String movieId, String created) {
        this.id = id;
        this.userId = userId;
        this.movieId = movieId;
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

    public String getMovieId() {
        return movieId;
    }

    public void setMovieId(String movieId) {
        this.movieId = movieId;
    }

    public String getCreated() {
        return created;
    }

    public void setCreated(String created) {
        this.created = created;
    }
}
