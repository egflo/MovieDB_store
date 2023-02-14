package com.movie_service.datafetcher;


import com.movie_service.models.Movie;
import com.movie_service.repository.MovieRepository;
import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;

@DgsComponent
public class MoviesDataFetcher {
    @Autowired
    private MovieRepository movieRepository;

    @DgsQuery
    public Movie movie(@InputArgument String id) {

        Optional<Movie> movie = movieRepository.getMovieById(new ObjectId(id));
        return movie.orElse(null);
    }

    @DgsQuery
    public List<Movie> movies(@InputArgument String title,
                                   @InputArgument Integer limit,
                                   @InputArgument Integer page,
                                   @InputArgument String sort) {


        limit = limit == null ? 10 : limit;
        page = page == null ? 0 : page;
        sort = sort == null ? "popularity" : sort;

        if (title == null) {
            return movieRepository.findAll(PageRequest.of(
                    page,
                    limit,
                    Sort.by(sort)
            )).stream().toList();
        }

        return movieRepository.getMovieByTitleContainingIgnoreCase(title, PageRequest.of(
                page,
                limit,
                Sort.by(sort)
        )).stream().toList();
    }
}
