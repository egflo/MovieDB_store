package com.movie_service.models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

/**
 * A movie's precomputed recommendations, best first: three parallel lists
 * (titles, IMDb ids, and why each was picked, e.g. "same director" or
 * "fans also liked it (4031 shared raters)"). One per titled movie.
 */
@Getter
@Setter
@NoArgsConstructor
// The collection's name is misspelt in the data.
@Document(collection = "reccomendations")
public class Recommendation {

    @Id
    private String id;

    String movieId;

    String title;

    List<String> recommendations;

    List<String> recommendationIds;

    List<String> recommendationReasons;

    Date updated;
}
