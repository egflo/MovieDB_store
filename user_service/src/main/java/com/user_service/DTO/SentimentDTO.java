package com.user_service.DTO;

import com.movie_service.models.Sentiment;
import com.movie_service.models.Status;

import java.util.Date;

public class SentimentDTO {
    private String id;

    private String userId;

    private String objectId;

    private Date created;

    private Status status;

    public SentimentDTO(Sentiment sentiment) {
        this.id = sentiment.getId();
        this.userId = sentiment.getUserId();
        this.objectId = sentiment.getObjectId();
        this.created = sentiment.getCreated();
        this.status = sentiment.getStatus();
    }

    public SentimentDTO(String userId, String objectId, Date created, Status status) {
        this.userId = userId;
        this.objectId = objectId;
        this.created = created;
        this.status = status;
    }

    public  String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public String getObjectId() {
        return objectId;
    }

    public void setObjectId(String objectId) {
        this.objectId = objectId;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

}
