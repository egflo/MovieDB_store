package com.user_service.DTO;

public class BookmarkRequest
{
    private String userId;
    private String movieId;

    public BookmarkRequest() {
    }

    public BookmarkRequest(String userId, String movieId) {
        this.userId = userId;
        this.movieId = movieId;
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

}
