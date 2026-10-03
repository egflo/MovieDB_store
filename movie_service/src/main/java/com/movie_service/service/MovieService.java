package com.movie_service.service;



import com.movie_service.DAO.MovieDAO;
import com.movie_service.exception.IdNotFoundException;
import com.movie_service.models.Movie;
import com.movie_service.models.Recommendation;
import com.movie_service.models.Suggestion;
import com.movie_service.models.Tag;
import com.movie_service.repository.MovieRepository;
import com.movie_service.repository.RecommendationRepository;
import com.movie_service.repository.SuggestionRepository;
import com.movie_service.repository.TagRepository;
import org.apache.commons.io.IOUtils;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class MovieService implements MovieServiceImp {

    static final Logger LOGGER = LoggerFactory.getLogger(MovieService.class);

    @Autowired
    MovieDAO movieDAO;

    @Autowired
    private MovieRepository repository;

    @Autowired
    private SuggestionRepository suggestionRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private RecommendationRepository recommendationRepository;


    @Override
    public Page<Movie> findAll(Pageable pageable) {
        Page<Movie> movies = repository.findAll(pageable);
        return movies;
    }


    @Override
    public Movie findByMovieId(String id) {

        LOGGER.info("findByMovieId id: {}", id);

        API api = new API(repository);
        //api.background(id);
        Optional<Movie> present = repository.getMovieByMovieId(id);
        // No inventory lookup here: it used to ask inventory for the product
        // and throw the answer away, so a movie without a product (or
        // inventory being down) turned its page into a 500.
        if (present.isPresent()) {
            Movie movie = present.get();
            return movie;
        }

       present = repository.getMovieById(new ObjectId(id));
        if (present.isPresent()) {
            Movie movie = present.get();
            return movie;
        }
        throw new IdNotFoundException("Movie with id " + id + " not found");
    }

    @Override
    public Page<Movie> findByTitle(String title, Pageable pageable) {
        return repository.getMovieByTitleContainingIgnoreCase(title, pageable);
    }

    @Override
    public Page<Movie> findMovieByCastId(String castId, Pageable pageable) {
        return repository.findMovieByCastId(castId, pageable);
    }

    @Override
    public Page<Movie> recommendMovies(String id, Pageable pageable) {
        // Takes the IMDb id or the Mongo id, like findByMovieId.
        String movieId = id.startsWith("tt") || !ObjectId.isValid(id)
                ? id
                : repository.getMovieById(new ObjectId(id)).map(Movie::getMovieId).orElse(id);

        // The movie's precomputed list, best first. It used to return any
        // movies sharing the first genre. No list (an untitled stub, an
        // unknown id) is an empty page.
        List<String> ranked = recommendationRepository.findByMovieId(movieId)
                .map(Recommendation::getRecommendationIds)
                .orElse(List.of());

        int from = (int) Math.min(pageable.getOffset(), ranked.size());
        int to = Math.min(from + pageable.getPageSize(), ranked.size());
        List<String> pageIds = ranked.subList(from, to);

        // One query for the page, then back into the list's order.
        Map<String, Movie> byId = new HashMap<>();
        for (Movie movie : repository.findByMovieIdIn(pageIds)) {
            byId.put(movie.getMovieId(), movie);
        }
        List<Movie> movies = new ArrayList<>();
        for (String recommended : pageIds) {
            Movie movie = byId.get(recommended);
            if (movie != null) movies.add(movie);
        }

        // Unsorted: the order is the ranking, whatever sort was asked for.
        return new PageImpl<>(movies, PageRequest.of(pageable.getPageNumber(), pageable.getPageSize()), ranked.size());
    }


    @Override
    public Page<Movie> getMoviesByTagId(Integer tagId, Pageable pageable) {
        return repository.getMovieByKeywordsByTagId(tagId, pageable);
    }

    @Override
    public Page<Movie> findMoviesByCriteria(Optional<String> title, HashMap<String, String[]> criteria, Pageable pageable) {
        return movieDAO.findMovieByParams(title, criteria, pageable);
    }

    @Override
    public Movie getMovie(String id) {
        Optional<Movie> movie = repository.findById(new ObjectId(id));
        if (movie.isPresent()) {
            return movie.get();
        }

        throw new IdNotFoundException("Movie with id " + id + " not found");

    }

    @Override
    public Page<Movie> getSuggestions(String movieId, Pageable pageable) {
        Page<Suggestion> suggestions =
                suggestionRepository.findSuggestionByMovieId(movieId, pageable);

        List<Movie> movies = new ArrayList<>();

        for(Suggestion suggest : suggestions.getContent()) {

            Optional<Movie> movie = repository.getMovieByMovieId(suggest.getSugMovieId());
            if (movie.isPresent()) {
                movies.add(movie.get());
            }
        }

        return new PageImpl<>(movies, pageable, suggestions.getTotalElements());
    }

    public List<Tag> getAllTags() {
        List<Tag> tags = tagRepository.findAll();
        LOGGER.info("getAllTags size: {}", tags.size());
        return tags;
    }
}

