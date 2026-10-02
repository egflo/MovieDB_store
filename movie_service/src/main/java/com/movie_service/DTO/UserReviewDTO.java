package com.movie_service.DTO;

import java.util.Date;

/**
 * One user review from another site, the same shape for every source. (The
 * store's own reviews are user_service's.)
 *
 * @param id        the Mongo id
 * @param source    "imdb", "letterboxd" or "metacritic"
 * @param title     IMDb only
 * @param rating    out of 10 for every source; null on a few Letterboxd ones
 * @param sentiment "positive" / "negative"; IMDb only
 * @param likes     Letterboxd likes or IMDb "found helpful" votes; null for Metacritic
 * @param liked     Letterboxd only: the reviewer gave the film a heart
 * @param url       the review on its site; IMDb only
 */
public record UserReviewDTO(String id, String source, String movieId, String title, String text, Integer rating,
                            String sentiment, Integer likes, Boolean liked, String url, Date date, Author user) {

    /**
     * @param name    the display name, falling back to the username
     * @param avatar  null for Metacritic
     * @param profile the author's page; IMDb only
     */
    public record Author(String id, String name, String avatar, String profile) {
    }
}
