package com.movie_service.DTO;

/**
 * One row of GET /movie/autocomplete: just what the search box shows. A full
 * Movie is ~3 KB (cast, plot, tags...); this is ~250 bytes.
 *
 * @param id      Mongo id; /movie/{id} accepts it (as well as movieId)
 * @param poster  null when the movie has none ("N/A" and "" are stored for missing ones)
 * @param ratings the fields the site's one-score rule picks from (web_app's pickScore:
 *                Rotten Tomatoes, else IMDb, else Metacritic), so the box shows the
 *                same score as the poster cards; 0 means missing, as in the data
 */
public record MovieSuggestion(String id, String movieId, String title, Integer year, String poster, Scores ratings) {

    public record Scores(Double rating, Double imdb, Double rottenTomatoes, String rottenTomatoesStatus,
                         Double metacritic) {
    }
}
