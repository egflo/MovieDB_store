package com.movie_service.grpc;


import com.movie_service.repository.MovieRepository;
import com.movie_service.service.MovieService;
import com.movie_service.models.Movie;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.bson.types.ObjectId;
import org.proto.grpc.Genre;
import org.proto.grpc.MovieRequest;
import org.proto.grpc.MovieServiceGrpc;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.proto.grpc.MovieResponse;
import org.proto.grpc.MovieServiceGrpc.MovieServiceImplBase;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@GrpcService
public class MovieServiceImpl extends MovieServiceGrpc.MovieServiceImplBase {

    //logger
    private static final Logger LOGGER = LoggerFactory.getLogger(MovieServiceImpl.class);

    @Autowired
    MovieRepository repository;

    /** Protobuf strings can't be null; send "" for a missing field. */
    private static String orEmpty(String value) {
        return value == null ? "" : value;
    }

    @Override
    public void getMovie(MovieRequest request, StreamObserver<MovieResponse> responseObserver) {

        String id  = request.getId();
        Optional<Movie> present = repository.getMovieById(new ObjectId(id));
        Movie movie = present.orElse(null);

        if(movie == null) {
            responseObserver.onError(Status.NOT_FOUND.withDescription("Movie not found: " + id).asRuntimeException());
            return;
        }

        LOGGER.info("Movie found: " + movie.getTitle());

        //Create empty list of genres
        List<Genre> genres = new ArrayList<>();
        for (String genre : movie.getGenres() == null ? List.<String>of() : movie.getGenres()) {
            Genre g = Genre.newBuilder().setName(genre).build();
            genres.add(g);
        }

        //Create response
        MovieResponse response = MovieResponse.newBuilder()
                // Protobuf setters throw on null, and most movies lack some of
                // these (about 95% have no content rating), so a null here made
                // every such movie fail: they couldn't be favourited.
                .setId(orEmpty(movie.getId()))
                .setTitle(orEmpty(movie.getTitle()))
                .setYear(movie.getYear() == null ? 0 : movie.getYear())
                .setRated(orEmpty(movie.getRated()))
                .setRuntime(orEmpty(movie.getRuntime()))
                .setBackground(orEmpty(movie.getBackground()))
                .setPlot(orEmpty(movie.getPlot()))
                .setDirector(orEmpty(movie.getDirector()))
                .setPoster(orEmpty(movie.getPoster()))
                .setSku(orEmpty(movie.getMovieId()))
                .setLogo(orEmpty(movie.getLogo()))
                //Genres is list of strings
                .addAllGenres(genres)
                .build();


        //log response
        LOGGER.info("Movie response: " + response.toString());

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
