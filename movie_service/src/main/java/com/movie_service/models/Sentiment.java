package com.movie_service.models;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "sentiment")
public class Sentiment {
    @Id
    private ObjectId id;

    private String userId;

    private ObjectId objectId;

    private Date created;

    private String status; // liked, disliked, loved, hated

    public Sentiment() {
    }

    public Sentiment(String userId, ObjectId objectId, Date created, String status) {
        this.userId = userId;
        this.objectId = objectId;
        this.created = created;
        this.status = status;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getObjectId() {
        return objectId.toHexString();
    }

    public void setObjectId(ObjectId objectId) {
        this.objectId = objectId;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

}
