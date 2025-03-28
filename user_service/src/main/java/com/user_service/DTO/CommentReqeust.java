package com.user_service.DTO;

import com.google.firebase.database.annotations.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Setter
@Getter
@NoArgsConstructor
public class CommmentReqeust {

    @NotNull
    String text;

    @NotNull
    String reviewId;

}
