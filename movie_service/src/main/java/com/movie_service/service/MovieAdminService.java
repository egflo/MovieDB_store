package com.movie_service.service;

import com.movie_service.DTO.MovieRequest;
import com.movie_service.exception.DuplicateException;
import com.movie_service.exception.IdNotFoundException;
import com.movie_service.models.Cast;
import com.movie_service.models.Movie;
import com.movie_service.models.Rating;
import com.movie_service.repository.MovieRepository;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Admin create and edit of movies (AdminController, ADMIN only at the gateway).
 *
 * Edits are a $set of the editable fields, never a whole-document save: the
 * documents carry fields the Movie class doesn't map (tags, type,
 * original_title, release_date, updated), and a save() would drop them. It
 * also leaves the price copy (PriceSyncService), popularity and keywords as
 * they are.
 */
@Service
public class MovieAdminService {

    static final Logger LOGGER = LoggerFactory.getLogger(MovieAdminService.class);

    private static final Pattern IMDB_TITLE_ID = Pattern.compile("tt\\d{7,10}");
    private static final Pattern IMDB_NAME_ID = Pattern.compile("nm\\d{7,10}");
    private static final Pattern WEB_URL = Pattern.compile("https?://\\S+");
    private static final int FIRST_FILM_YEAR = 1874;
    private static final String COLLECTION = "movies";

    @Autowired
    private MovieRepository repository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Movie create(MovieRequest request) {
        String movieId = trim(request.getMovieId());
        if (movieId == null || !IMDB_TITLE_ID.matcher(movieId).matches()) {
            throw new IllegalArgumentException("IMDb id must look like tt0468569");
        }
        // No unique index on movieId in the data, so check by hand.
        if (repository.getMovieByMovieId(movieId).isPresent()) {
            throw new DuplicateException("A movie with IMDb id " + movieId + " already exists");
        }

        Movie movie = new Movie();
        movie.setId(new ObjectId());
        movie.setMovieId(movieId);
        movie.setPopularity(0.0);
        movie.setKeywords(new ArrayList<>());
        apply(validated(request), movie);
        repository.insert(movie);

        // The fields every imported record has but Movie doesn't map. Written
        // to the collection by name, not through Movie.class: the class maps
        // its `tags` property to the "keywords" field, so a mapped update
        // would set keywords instead of the document's own "tags".
        mongoTemplate.updateFirst(byId(movie.getId()), new Update()
                .set("type", "movie")
                .set("original_title", movie.getTitle())
                .set("tags", new ArrayList<>())
                .set("updated", new Date()), COLLECTION);

        LOGGER.info("Admin created movie {} ({})", movie.getId(), movieId);
        return repository.findById(new ObjectId(movie.getId())).orElse(movie);
    }

    public Movie update(String id, MovieRequest request) {
        ObjectId objectId = parseId(id);
        if (!repository.existsById(objectId)) {
            throw new IdNotFoundException("Movie with id " + id + " not found");
        }

        Movie edited = new Movie();
        apply(validated(request), edited);

        Update update = new Update()
                .set("title", edited.getTitle())
                .set("year", edited.getYear())
                .set("rated", edited.getRated())
                .set("runtime", edited.getRuntime())
                .set("genres", edited.getGenres())
                .set("director", edited.getDirector())
                .set("writer", edited.getWriter())
                .set("boxOffice", edited.getBoxOffice())
                .set("revenue", edited.getRevenue())
                .set("production", edited.getProduction())
                .set("plot", edited.getPlot())
                .set("language", edited.getLanguage())
                .set("country", edited.getCountry())
                .set("awards", edited.getAwards())
                .set("poster", edited.getPoster())
                .set("background", edited.getBackground())
                .set("logo", edited.getLogo())
                .set("cast", edited.getCast())
                .set("ratings", edited.getRatings())
                .set("updated", new Date());
        mongoTemplate.updateFirst(byId(id), update, Movie.class);

        LOGGER.info("Admin edited movie {}", id);
        return repository.findById(objectId)
                .orElseThrow(() -> new IdNotFoundException("Movie with id " + id + " not found"));
    }

    /** Checks the request and returns it with strings trimmed and blanks as null. */
    private MovieRequest validated(MovieRequest r) {
        r.setTitle(trim(r.getTitle()));
        if (r.getTitle() == null) throw new IllegalArgumentException("Title is required");

        int maxYear = Year.now().getValue() + 5;
        if (r.getYear() == null || r.getYear() < FIRST_FILM_YEAR || r.getYear() > maxYear) {
            throw new IllegalArgumentException("Year must be between " + FIRST_FILM_YEAR + " and " + maxYear);
        }
        if (r.getRevenue() != null && r.getRevenue() < 0) {
            throw new IllegalArgumentException("Revenue can't be negative");
        }

        r.setRated(trim(r.getRated()));
        r.setRuntime(trim(r.getRuntime()));
        r.setDirector(trim(r.getDirector()));
        r.setWriter(trim(r.getWriter()));
        r.setBoxOffice(trim(r.getBoxOffice()));
        r.setProduction(trim(r.getProduction()));
        r.setPlot(trim(r.getPlot()));
        r.setLanguage(trim(r.getLanguage()));
        r.setCountry(trim(r.getCountry()));
        r.setAwards(trim(r.getAwards()));
        r.setPoster(url(r.getPoster(), "Poster"));
        r.setBackground(url(r.getBackground(), "Background"));
        r.setLogo(url(r.getLogo(), "Logo"));
        r.setGenres(genres(r.getGenres()));
        r.setCast(cast(r.getCast()));
        r.setRatings(ratings(r.getRatings()));
        return r;
    }

    private static void apply(MovieRequest r, Movie movie) {
        movie.setTitle(r.getTitle());
        movie.setYear(r.getYear());
        movie.setRated(r.getRated());
        movie.setRuntime(r.getRuntime());
        movie.setGenres(r.getGenres());
        movie.setDirector(r.getDirector());
        movie.setWriter(r.getWriter());
        movie.setBoxOffice(r.getBoxOffice());
        movie.setRevenue(r.getRevenue());
        movie.setProduction(r.getProduction());
        movie.setPlot(r.getPlot());
        movie.setLanguage(r.getLanguage());
        movie.setCountry(r.getCountry());
        movie.setAwards(r.getAwards());
        movie.setPoster(r.getPoster());
        movie.setBackground(r.getBackground());
        movie.setLogo(r.getLogo());
        movie.setCast(r.getCast());
        movie.setRatings(r.getRatings());
    }

    private static List<String> genres(List<String> genres) {
        LinkedHashSet<String> unique = new LinkedHashSet<>();
        if (genres != null) {
            for (String genre : genres) {
                String g = trim(genre);
                if (g != null) unique.add(g);
            }
        }
        return new ArrayList<>(unique);
    }

    /** Keeps the admin's order; drops rows without a name. */
    private static List<Cast> cast(List<Cast> cast) {
        List<Cast> result = new ArrayList<>();
        if (cast == null) return result;
        for (Cast c : cast) {
            if (c == null || trim(c.getName()) == null) continue;
            String id = trim(c.getId());
            if (id != null && !IMDB_NAME_ID.matcher(id).matches()) {
                throw new IllegalArgumentException("Cast id for " + c.getName() + " must look like nm0000123");
            }
            List<String> characters = new ArrayList<>();
            if (c.getCharacters() != null) {
                for (String character : c.getCharacters()) {
                    String ch = trim(character);
                    if (ch != null) characters.add(ch);
                }
            }
            result.add(new Cast(id, trim(c.getName()), trim(c.getCategory()), characters, url(c.getPhoto(), "Cast photo")));
        }
        return result;
    }

    /** 0 means missing in this data, so blanks stay null rather than 0. */
    private static Rating ratings(Rating r) {
        if (r == null) return null;
        range(r.getRating(), 0, 10, "IMDb rating");
        range(r.getImdb(), 0, 10, "IMDb score");
        range(r.getMetacritic(), 0, 100, "Metacritic");
        range(r.getRottenTomatoes(), 0, 100, "Rotten Tomatoes");
        range(r.getRottenTomatoesAudience(), 0, 100, "Rotten Tomatoes audience");
        if (r.getNumOfVotes() != null && r.getNumOfVotes() < 0) {
            throw new IllegalArgumentException("Votes can't be negative");
        }
        r.setRottenTomatoesStatus(trim(r.getRottenTomatoesStatus()));
        r.setRottenTomatoesAudienceStatus(trim(r.getRottenTomatoesAudienceStatus()));
        return r;
    }

    private static void range(Double value, double min, double max, String name) {
        if (value != null && (value < min || value > max)) {
            throw new IllegalArgumentException(name + " must be between " + (int) min + " and " + (int) max);
        }
    }

    private static String url(String value, String name) {
        String v = trim(value);
        if (v != null && !WEB_URL.matcher(v).matches()) {
            throw new IllegalArgumentException(name + " must be an http(s) URL");
        }
        return v;
    }

    private static String trim(String value) {
        if (value == null) return null;
        String v = value.trim();
        return v.isEmpty() ? null : v;
    }

    private static ObjectId parseId(String id) {
        if (id == null || !ObjectId.isValid(id)) {
            throw new IdNotFoundException("Movie with id " + id + " not found");
        }
        return new ObjectId(id);
    }

    private static Query byId(String id) {
        return new Query(Criteria.where("_id").is(new ObjectId(id)));
    }
}
