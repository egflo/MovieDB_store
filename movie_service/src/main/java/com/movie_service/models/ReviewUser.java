package com.movie_service.models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * The author embedded in a user review. Each source fills a different subset:
 * IMDb has profile and avatar, Letterboxd puts the display name in firstname,
 * Metacritic has only id and username.
 */
@Getter
@Setter
@NoArgsConstructor
public class ReviewUser {

    // Without @Field a property called id is read from "_id", which these don't have.
    @Field("id")
    String id;

    String username;

    String firstname;

    String profile;

    String avatar;
}
