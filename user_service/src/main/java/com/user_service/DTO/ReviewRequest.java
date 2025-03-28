package com.user_service.DTO;


import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

@RequiredArgsConstructor
@Accessors(fluent = true) // allows for fluent setters
@Getter
class User {
    private final @NonNull String id;

    private final @NonNull String displayName;

    private final @NonNull String email;

}


@RequiredArgsConstructor
@Accessors(fluent = true) // allows for fluent setters
@Getter
public class ReviewRequest {
    String id; // id  optional if creating a new review else required

    private final @NonNull String title; // title of the review (required)

    private final @NonNull String content; // content of the review (required)

    private final @NonNull String userId; // id of the user that wrote the review (required)

    private final @NonNull String movieId; // id of the movie that the review is about (required)

    private final @NonNull Integer rating; // rating of the movie (required)

    private final @NonNull Integer sentiment; // sentiment of the review (required)

    private final @NonNull User user; // user that wrote the review (required)

}
