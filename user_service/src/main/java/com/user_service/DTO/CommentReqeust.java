package com.user_service.DTO;

import com.google.firebase.database.annotations.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Setter
@Getter
@NoArgsConstructor
public class CommentReqeust {

    @NotNull
    String text;

    @NotNull
    String reviewId;

    @NotNull
    String movieId;

    @NotNull
    String userId;

    String parent; // parent comment id if it is a reply else null
}
