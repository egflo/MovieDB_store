package com.user_service.models;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@Document(collection = "movies")
public class Movie {

    ObjectId id;

    String title;

    Integer year;

    String rated;

    String runtime;

    List<String> genres;

    String poster;

    String background;

    @Field("logo")
    String logo;

    String movieId;

}
