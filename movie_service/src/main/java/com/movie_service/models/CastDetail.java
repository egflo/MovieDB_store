package com.movie_service.models;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "cast")
public class CastDetail {
    ObjectId id;
    String name;
    String bio;
    String dob;

    @Field("birth_place")
    String birthplace;
    String photo;
    String dod;

    @Field("id")
    String castId;

    public CastDetail() {
    }

    public CastDetail(String name, String bio, String dob, String birthplace, String photo, String dod, String id) {
        this.name = name;
        this.bio = bio;
        this.dob = dob;
        this.birthplace = birthplace;
        this.photo = photo;
        this.dod = dod;
        this.castId = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public String getBirthplace() {
        return birthplace;
    }

    public void setBirthplace(String birthplace) {
        this.birthplace = birthplace;
    }


    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public String getDod() {
        return dod;
    }

    public void setDod(String dod) {
        this.dod = dod;
    }

    public String getId() {
        return id.toHexString();
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getCastId() {
        return castId;
    }

    public void setCastId(String castId) {
        this.castId = castId;
    }
    @Override
    public String toString() {
        return "CastDetail{" +
                "name='" + name + '\'' +
                ", bio='" + bio + '\'' +
                ", dob='" + dob + '\'' +
                ", birthplace='" + birthplace + '\'' +
                ", photo='" + photo + '\'' +
                ", dod='" + dod + '\'' +
                ", id='" + id + '\'' +
                '}';
    }

}
