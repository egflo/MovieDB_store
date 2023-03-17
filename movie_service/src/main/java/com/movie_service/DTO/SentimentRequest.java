package com.movie_service.DTO;

import com.movie_service.models.Status;

public class SentimentRequest {
    private String userId;
    private String objectId;
    private String status;
    private Long created;


    public SentimentRequest() {
    }

    public SentimentRequest(String userId, String objectId, String status, Long created) {
        this.userId = userId;
        this.objectId = objectId;
        this.status = status;
        this.created = created;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getObjectId() {
        return objectId;
    }

    public void setObjectId(String objectId) {
        this.objectId = objectId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getCreated() {
        return created;
    }

    public void setCreated(Long created) {
        this.created = created;
    }

    // Overriding toString() method of String class
    @Override
    public String toString() {

        return "SentimentRequest [userId=" + userId + ", objectId=" + objectId + ", status=" + status + ", created=" + created + "]";
    }

}
