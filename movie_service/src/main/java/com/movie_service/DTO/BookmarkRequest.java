package com.movie_service.DTO;

public class BookmarkRequest
{
    private String userId;
    private String movieId;
    private String created;

    public BookmarkRequest() {
    }

    public BookmarkRequest(String userId, String movieId, String created) {
        this.userId = userId;
        this.movieId = movieId;
        this.created = created;
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
