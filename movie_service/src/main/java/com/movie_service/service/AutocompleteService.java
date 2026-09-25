package com.movie_service.service;

import com.movie_service.DTO.MovieSuggestion;
import com.movie_service.DTO.PersonSuggestion;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Suggestions for the search box, as you type: GET /movie/autocomplete and
 * GET /cast/autocomplete. Unlike /movie/search, which sorts matches by
 * popularity alone and pages them (a count on every call), these rank by how
 * the text matches, return a few slim rows, and never count.
 *
 * Matching is case- and accent-insensitive ("amelie" finds Amélie) without a
 * normalised copy of the data: each vowel, c, n and y in the text becomes a
 * character class of its accented forms. Titles match anywhere, like
 * /movie/search, people at the start of a word; neither can use an index.
 * Over the ~100k movies that's 35-100 ms for titles and 200-370 ms for
 * people (measured locally).
 */
@Service
public class AutocompleteService {

    public static final int DEFAULT_LIMIT = 6;
    private static final int MAX_LIMIT = 20;
    private static final int MAX_QUERY = 100;

    /** Credits people search for. Writers, producers, composers etc. are ~60% of credits and crowded out actors. */
    private static final List<String> PERSON_ROLES = List.of("actor", "actress", "director", "self");

    private static final Map<Character, String> ACCENTS = Map.of(
            'a', "aàáâãäåAÀÁÂÃÄÅ",
            'c', "cçCÇ",
            'e', "eèéêëEÈÉÊË",
            'i', "iìíîïIÌÍÎÏ",
            'n', "nñNÑ",
            'o', "oòóôõöøOÒÓÔÕÖØ",
            'u', "uùúûüUÙÚÛÜ",
            'y', "yýÿYÝŸ");

    /** The start of a title, past a leading article: "dark" starts "The Dark Knight". */
    private static final String TITLE_START = "^((the|a|an)\\s+)?";

    /** Where a word starts: the start, or after a space or punctuation ("Spider-Man", "Star Wars: Episode"). */
    private static final String WORD_START = "(^|[\\s\\-.:'\"(/])";

    @Autowired
    private MongoTemplate mongoTemplate;

    /** The text as a regex: metacharacters escaped (a "(" was a 500 in search), letters accent-folded. */
    static String pattern(String text) {
        StringBuilder out = new StringBuilder();
        for (char ch : text.toCharArray()) {
            String accents = ACCENTS.get(Character.toLowerCase(ch));
            if (accents != null) out.append('[').append(accents).append(']');
            else if ("\\^$.|?*+()[]{}".indexOf(ch) >= 0) out.append('\\').append(ch);
            else out.append(ch);
        }
        return out.toString();
    }

    /**
     * Trimmed, capped, and accents dropped ("pénélope" -> "penelope"), so
     * pattern() matches every spelling. Empty means "nothing to suggest".
     */
    static String clean(String query) {
        if (query == null) return "";
        String q = Normalizer.normalize(query, Normalizer.Form.NFD).replaceAll("\\p{M}", "")
                .strip().replaceAll("\\s+", " ");
        return q.length() > MAX_QUERY ? q.substring(0, MAX_QUERY) : q;
    }

    private static int clampLimit(Integer limit) {
        return limit == null ? DEFAULT_LIMIT : Math.max(1, Math.min(MAX_LIMIT, limit));
    }

    private static Document regex(String pattern) {
        return new Document("$regex", pattern).append("$options", "i");
    }

    private static Document regexMatch(String field, String pattern) {
        return new Document("$regexMatch", new Document("input", field).append("regex", pattern).append("options", "i"));
    }

    /** Stored as int, long or double depending on the record. */
    private static Double number(Document d, String key) {
        return d.get(key) instanceof Number n ? n.doubleValue() : null;
    }

    private static String imageOrNull(Object value) {
        return value instanceof String s && s.matches("(?i)^https?://.*") ? s : null;
    }

    /**
     * Titles that start with the text first, ignoring a leading "The", "A"
     * or "An" ("bat" -> Batman, "dark" -> The Dark Knight), then titles with
     * a word that does ("knight" -> The Dark Knight), then the rest ("The Bad
     * Batch"); popularity orders each group, as on the site.
     * Untitled stub records have no title, so they never match.
     */
    public List<MovieSuggestion> movies(String query, Integer limit) {
        String q = clean(query);
        if (q.isEmpty()) return List.of();
        String p = pattern(q);

        List<Document> pipeline = List.of(
                new Document("$match", new Document("title", regex(p))),
                new Document("$project", new Document("title", 1).append("year", 1).append("poster", 1)
                        .append("movieId", 1).append("popularity", 1)
                        .append("ratings.rating", 1).append("ratings.imdb", 1).append("ratings.rottenTomatoes", 1)
                        .append("ratings.rottenTomatoesStatus", 1).append("ratings.metacritic", 1)),
                new Document("$addFields", new Document("rank", new Document("$cond", List.of(
                        regexMatch("$title", TITLE_START + p), 0,
                        new Document("$cond", List.of(regexMatch("$title", WORD_START + p), 1, 2)))))),
                new Document("$sort", new Document("rank", 1).append("popularity", -1).append("_id", 1)),
                new Document("$limit", clampLimit(limit)));

        List<MovieSuggestion> out = new ArrayList<>();
        for (Document d : mongoTemplate.getCollection("movies").aggregate(pipeline)) {
            Number year = d.get("year", Number.class);
            Document r = d.get("ratings", Document.class);
            MovieSuggestion.Scores scores = r == null ? null : new MovieSuggestion.Scores(
                    number(r, "rating"), number(r, "imdb"), number(r, "rottenTomatoes"),
                    r.getString("rottenTomatoesStatus"), number(r, "metacritic"));
            out.add(new MovieSuggestion(
                    d.getObjectId("_id").toHexString(),
                    d.getString("movieId"),
                    d.getString("title"),
                    year == null || year.intValue() == 0 ? null : year.intValue(),
                    imageOrNull(d.get("poster")),
                    scores));
        }
        return out;
    }

    /**
     * People from the store's own credits (so each has a filmography here),
     * not the 319k-person cast collection, which has no sign of who's well
     * known. Only names with a word starting with the text ("ch" -> Chris
     * Evans, "evans" -> Chris Evans, "nolan" -> Christopher Nolan), not the
     * middle of a word (Richard for "ch"): those were rarely wanted, and
     * leaving them out made two-letter searches 3-5x faster (measured: "an"
     * 1.7 s -> 0.37 s). Ordered by the total IMDb votes of their films, so
     * the famous come first. Needs two characters: one matches nearly
     * everyone and took over a second.
     */
    public List<PersonSuggestion> people(String query, Integer limit) {
        String q = clean(query);
        if (q.length() < 2) return List.of();
        String p = WORD_START + pattern(q);
        Document inRole = new Document("$in", PERSON_ROLES);

        List<Document> pipeline = List.of(
                new Document("$match", new Document("cast", new Document("$elemMatch",
                        new Document("name", regex(p)).append("category", inRole)))),
                new Document("$project", new Document("title", 1).append("votes", "$ratings.numOfVotes").append("cast", 1)),
                // Most-voted first, so $first below is each person's best-known film.
                new Document("$sort", new Document("votes", -1).append("_id", 1)),
                new Document("$unwind", "$cast"),
                new Document("$match", new Document("cast.name", regex(p)).append("cast.category", inRole)),
                new Document("$group", new Document("_id", "$cast.castId")
                        .append("name", new Document("$first", "$cast.name"))
                        .append("photo", new Document("$first", "$cast.photo"))
                        .append("knownFor", new Document("$first", "$title"))
                        .append("roles", new Document("$addToSet", "$cast.category"))
                        .append("films", new Document("$addToSet", "$_id"))
                        .append("fame", new Document("$sum", new Document("$ifNull", List.of("$votes", 0))))),
                new Document("$sort", new Document("fame", -1).append("_id", 1)),
                new Document("$limit", clampLimit(limit)));

        List<PersonSuggestion> out = new ArrayList<>();
        for (Document d : mongoTemplate.getCollection("movies").aggregate(pipeline)) {
            if (!(d.get("_id") instanceof String id)) continue; // credits without a castId can't be linked
            List<String> roles = d.getList("roles", String.class, List.of()).stream().sorted().toList();
            List<ObjectId> films = d.getList("films", ObjectId.class, List.of());
            out.add(new PersonSuggestion(id, d.getString("name"), imageOrNull(d.get("photo")), roles,
                    d.getString("knownFor"), films.size()));
        }
        return out;
    }
}
