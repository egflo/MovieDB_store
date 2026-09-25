package com.movie_service.DTO;

import java.util.List;

/**
 * One row of GET /cast/autocomplete.
 *
 * @param id       the cast id (nm...), as /cast/{id} takes it
 * @param photo    null when missing
 * @param roles    credit categories in the store's films, e.g. ["actor", "director"]
 * @param knownFor the title of their most-voted film in the store
 * @param films    how many of the store's films credit them in those roles
 */
public record PersonSuggestion(String id, String name, String photo, List<String> roles, String knownFor, int films) {
}
