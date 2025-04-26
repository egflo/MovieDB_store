package com.user_service.DTO;


import com.mongodb.annotations.Sealed;
import com.user_service.models.Status;
import com.user_service.models.User;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.experimental.Accessors;


@RequiredArgsConstructor
@Accessors(fluent = true) // allows for fluent setters
@Getter
@Sealed
public class ReviewRequest {
    String id; // id  optional if creating a new review else required

    private final @NonNull String title; // title of the review (required)

    private final @NonNull String content; // content of the review (required)

    private final @NonNull String movieId; // id of the movie that the review is about (required)

    private final @NonNull Integer rating; // rating of the movie (required)

    private final @NonNull Boolean love; // sentiment of the review (required)

    private final @NonNull String userId; // sentiment of the review (required)

    public String getUserId() {
        return userId;
    }
}
