package com.movie_service.DTO;

import java.util.Map;

/**
 * How many reviews a movie has per source, so a page can show only the tabs
 * that have something. Keys are the source names the review routes take.
 */
public record ReviewCounts(Map<String, Long> critic, Map<String, Long> user) {
}
