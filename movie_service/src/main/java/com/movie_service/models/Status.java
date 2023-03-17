package com.movie_service.models;

public enum Status {
    LIKE("like"),
    DISLIKE("dislike"),
    LOVE("love"),
    NONE("none");


    private String status;

    Status(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
