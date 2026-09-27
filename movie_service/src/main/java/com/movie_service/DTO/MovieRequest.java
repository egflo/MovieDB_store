package com.movie_service.DTO;

import com.movie_service.models.Cast;
import com.movie_service.models.Rating;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Body of the admin create and edit endpoints (AdminController): the fields
 * an admin can set on a movie. Everything else on a movie (id, popularity,
 * keywords, the price copy, and the Mongo-only fields) is left alone.
 *
 * `movieId` (the IMDb id) is read on create only: inventory's SKU and the
 * suggestions collection are keyed on it, so it doesn't change afterwards.
 */
@Getter
@Setter
@NoArgsConstructor
public class MovieRequest {
    String movieId;
    String title;
    Integer year;
    String rated;
    String runtime;
    List<String> genres;
    String director;
    String writer;
    /** Display text, e.g. "$534,858,444" (US box office in the data). */
    String boxOffice;
    /** Worldwide gross in dollars; the store's "Box office" sort uses it. */
    Long revenue;
    String production;
    String plot;
    String language;
    String country;
    String awards;
    String poster;
    String background;
    String logo;
    List<Cast> cast;
    Rating ratings;
}
