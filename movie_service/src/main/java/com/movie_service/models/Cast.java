package com.movie_service.models;

import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

public class Cast {


    @Field("castId")
    String id;
    String name;

    String category;

    List<String> characters;

    String photo;


    public Cast() {
    }

    public Cast(String castId, String name, String category, List<String> characters, String photo) {
        this.id = castId;
        this.name = name;
        this.category = category;
        this.characters = characters;
        this.photo = photo;
    }

    public String getId() {
        return id;
    }

    public void setId(String castId) {
        this.id = castId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getCharacters() {
        return characters;
    }

    public void setCharacters(List<String> characters) {
        this.characters = characters;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }
}
