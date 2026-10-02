package com.movie_service.DTO;

import java.util.Date;

/**
 * One critic review, the same shape for every source.
 *
 * @param id              the Mongo id
 * @param source          "rt" or "metacritic"
 * @param score           as the critic wrote it ("3.5/5", "B", "80"); null when none
 * @param scoreNormalized 0-100; null when the critic gave no score
 * @param sentiment       "positive", "mixed" (Metacritic only) or "negative"
 * @param state           Rotten Tomatoes' "fresh" / "rotten"; null for Metacritic
 * @param topCritic       Rotten Tomatoes only; null for Metacritic
 * @param url             the full review; Rotten Tomatoes only, and not always
 * @param date            null on about half of Metacritic's
 */
public record CriticReviewDTO(String id, String source, String movieId, String critic, String publication,
                              String score, Integer scoreNormalized, String sentiment, String state,
                              Boolean topCritic, String text, String url, Date date) {
}
