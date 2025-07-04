package com.movie_service.models;


import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
@Document(collection = "tags")
public class Tag {
    @Id
    private String id;

    @Field("tag_id")
    private Integer tag_id;

    private String name;

    public Tag() {
    }
    public Tag(String id, Integer tag_id, String name) {
        this.id = id;
        this.tag_id = tag_id;
        this.name = name;
    }

}
