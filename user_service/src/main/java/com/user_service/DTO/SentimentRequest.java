package com.user_service.DTO;

public class SentimentRequest {
    private String userId;
    private String objectId;
    private String status;
    private Long date;

    public SentimentRequest() {
    }

    public SentimentRequest(String userId, String objectId, String status, Long created) {
        this.userId = userId;
        this.objectId = objectId;
        this.status = status;
        this.date = created;
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

    public Long getDate() {
        return date;
    }

    public void setDate(Long created) {
        this.date = created;
    }

    // Overriding toString() method of String class
    @Override
    public String toString() {

        return "SentimentRequest [userId=" + userId + ", objectId=" + objectId + ", status=" + status + ", created=" + date + "]";
    }

}
