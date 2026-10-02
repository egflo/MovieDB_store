package com.movie_service.service;


import com.movie_service.DTO.CriticReviewDTO;
import com.movie_service.DTO.ReviewCounts;
import com.movie_service.DTO.UserReviewDTO;
import com.movie_service.exception.IdNotFoundException;
import com.movie_service.models.CriticReview;
import com.movie_service.models.IMDBReview;
import com.movie_service.models.LetterboxdReview;
import com.movie_service.models.MetacriticCriticReview;
import com.movie_service.models.MetacriticUserReview;
import com.movie_service.models.ReviewUser;
import com.movie_service.repository.CriticReviewRepository;
import com.movie_service.repository.IMDBReviewRepository;
import com.movie_service.repository.LetterboxdReviewRepository;
import com.movie_service.repository.MetacriticCriticReviewRepository;
import com.movie_service.repository.MetacriticUserReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Reviews collected from other sites, one collection per source, read through
 * two shapes: critic (Rotten Tomatoes, Metacritic) and user (IMDb, Letterboxd,
 * Metacritic). Sources stay separate lists: the same critic review is often in
 * both critic collections, and they share no complete sort key.
 */
@Service
public class ReviewService implements ReviewServiceImp {

    public static final String RT = "rt";
    public static final String METACRITIC = "metacritic";
    public static final String IMDB = "imdb";
    public static final String LETTERBOXD = "letterboxd";

    private static final int MAX_LIMIT = 50;

    // What each sortBy means in each collection (model property names).
    private static final Map<String, String> RT_SORTS = Map.of("date", "creation_date", "score", "scoreNormalized");
    private static final Map<String, String> METACRITIC_CRITIC_SORTS = Map.of("date", "creation_date", "score", "score");
    private static final Map<String, String> IMDB_SORTS = Map.of("date", "date", "rating", "rating", "likes", "helpful.found");
    private static final Map<String, String> LETTERBOXD_SORTS = Map.of("date", "date", "rating", "rating", "likes", "likes");
    private static final Map<String, String> METACRITIC_USER_SORTS = Map.of("date", "date", "rating", "rating");

    private final CriticReviewRepository rottenTomatoes;
    private final MetacriticCriticReviewRepository metacriticCritics;
    private final IMDBReviewRepository imdb;
    private final LetterboxdReviewRepository letterboxd;
    private final MetacriticUserReviewRepository metacriticUsers;

    public ReviewService(CriticReviewRepository rottenTomatoes,
                         MetacriticCriticReviewRepository metacriticCritics,
                         IMDBReviewRepository imdb,
                         LetterboxdReviewRepository letterboxd,
                         MetacriticUserReviewRepository metacriticUsers) {
        this.rottenTomatoes = rottenTomatoes;
        this.metacriticCritics = metacriticCritics;
        this.imdb = imdb;
        this.letterboxd = letterboxd;
        this.metacriticUsers = metacriticUsers;
    }

    @Override
    public Page<CriticReviewDTO> getCriticReviews(String source, String movieId, int page, int limit, String sortBy, Sort.Direction direction) {
        return switch (source) {
            case RT -> rottenTomatoes.findReviewByMovieId(movieId, pageable(page, limit, RT_SORTS, sortBy, direction))
                    .map(ReviewService::toDTO);
            case METACRITIC -> metacriticCritics.findByMovieId(movieId, pageable(page, limit, METACRITIC_CRITIC_SORTS, sortBy, direction))
                    .map(ReviewService::toDTO);
            default -> throw new IdNotFoundException("No critic reviews from '" + source + "' (rt, metacritic)");
        };
    }

    @Override
    public Page<UserReviewDTO> getUserReviews(String source, String movieId, int page, int limit, String sortBy, Sort.Direction direction) {
        return switch (source) {
            case IMDB -> imdb.findByMovieId(movieId, pageable(page, limit, IMDB_SORTS, sortBy, direction))
                    .map(ReviewService::toDTO);
            case LETTERBOXD -> letterboxd.findByMovieId(movieId, pageable(page, limit, LETTERBOXD_SORTS, sortBy, direction))
                    .map(ReviewService::toDTO);
            case METACRITIC -> metacriticUsers.findByMovieId(movieId, pageable(page, limit, METACRITIC_USER_SORTS, sortBy, direction))
                    .map(ReviewService::toDTO);
            default -> throw new IdNotFoundException("No user reviews from '" + source + "' (imdb, letterboxd, metacritic)");
        };
    }

    @Override
    public ReviewCounts countReviews(String movieId) {
        Map<String, Long> critic = new LinkedHashMap<>();
        critic.put(RT, rottenTomatoes.countByMovieId(movieId));
        critic.put(METACRITIC, metacriticCritics.countByMovieId(movieId));

        Map<String, Long> user = new LinkedHashMap<>();
        user.put(IMDB, imdb.countByMovieId(movieId));
        user.put(LETTERBOXD, letterboxd.countByMovieId(movieId));
        user.put(METACRITIC, metacriticUsers.countByMovieId(movieId));

        return new ReviewCounts(critic, user);
    }

    /**
     * Newest first unless asked otherwise. The id breaks ties, since many
     * reviews share a date or have none, and pages would otherwise repeat rows.
     */
    private static Pageable pageable(int page, int limit, Map<String, String> sorts, String sortBy, Sort.Direction direction) {
        String property = sorts.get(sortBy);
        if (property == null) {
            throw new IllegalArgumentException("sortBy must be one of " + sorts.keySet().stream().sorted().toList());
        }
        return PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(limit, 1), MAX_LIMIT),
                Sort.by(direction, property).and(Sort.by(direction, "id"))
        );
    }

    private static CriticReviewDTO toDTO(CriticReview r) {
        return new CriticReviewDTO(
                r.getId(), RT, r.getMovieId(), blankToNull(r.getCritic_name()), blankToNull(r.getPublication_name()),
                blankToNull(r.getScore()),
                r.getScoreNormalized() == null ? null : (int) Math.round(r.getScoreNormalized()),
                lower(r.getSentiment()), lower(r.getReview_state()), r.getIsTopCritic(),
                blankToNull(r.getText()), blankToNull(r.getReview_url()), r.getCreation_date()
        );
    }

    private static CriticReviewDTO toDTO(MetacriticCriticReview r) {
        return new CriticReviewDTO(
                r.getId(), METACRITIC, r.getMovieId(), blankToNull(r.getCritic_name()), blankToNull(r.getPublication_name()),
                r.getScore() == null ? null : String.valueOf(r.getScore()), r.getScore(),
                lower(r.getSentiment()), null, null,
                blankToNull(r.getText()), null, r.getCreation_date()
        );
    }

    private static UserReviewDTO toDTO(IMDBReview r) {
        return new UserReviewDTO(
                r.getId(), IMDB, r.getMovieId(), blankToNull(r.getTitle()), blankToNull(r.getText()), r.getRating(),
                lower(r.getSentiment()), r.getHelpful() == null ? null : r.getHelpful().getFound(), null,
                blankToNull(r.getPermalink()), r.getDate(), author(r.getUser())
        );
    }

    private static UserReviewDTO toDTO(LetterboxdReview r) {
        return new UserReviewDTO(
                r.getId(), LETTERBOXD, r.getMovieId(), null, blankToNull(r.getText()), r.getRating(),
                null, r.getLikes(), r.getLiked(), null, r.getDate(), author(r.getUser())
        );
    }

    private static UserReviewDTO toDTO(MetacriticUserReview r) {
        return new UserReviewDTO(
                r.getId(), METACRITIC, r.getMovieId(), blankToNull(r.getTitle()), blankToNull(r.getText()), r.getRating(),
                lower(r.getSentiment()), null, null, null, r.getDate(), author(r.getUser())
        );
    }

    private static UserReviewDTO.Author author(ReviewUser u) {
        if (u == null) return null;
        String name = blankToNull(u.getFirstname());
        return new UserReviewDTO.Author(
                u.getId(), name != null ? name : u.getUsername(), blankToNull(u.getAvatar()), blankToNull(u.getProfile())
        );
    }

    // The sources disagree on case: "POSITIVE" (critics), "positive" (IMDb).
    private static String lower(String s) {
        s = blankToNull(s);
        return s == null ? null : s.toLowerCase(Locale.ROOT);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
