package com.user_service.models;

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

    private Status status;

    public Sentiment() {
    }

    public Sentiment(String userId, ObjectId objectId, Date created, Status status) {
        this.userId = userId;
        this.objectId = objectId;
        this.created = created;
        this.status = status;
    }

    public String getId() {
        return id.toHexString();
    }

    public void setId(ObjectId id) {
        this.id = id;
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

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

}
