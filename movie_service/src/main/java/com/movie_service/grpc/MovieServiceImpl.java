package com.movie_service.grpc;


import com.movie_service.repository.MovieRepository;
import com.movie_service.service.MovieService;
import com.movie_service.models.Movie;
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

    @Override
    public void getMovie(MovieRequest request, StreamObserver<MovieResponse> responseObserver) {

        String id  = request.getId();
        Optional<Movie> present = repository.getMovieById(new ObjectId(id));
        Movie movie = present.orElse(null);

        if(movie == null) {
            responseObserver.onError(new Exception("Movie not found"));
            return;
        }

        LOGGER.info("Movie found: " + movie.getTitle());

        //Create empty list of genres
        List<Genre> genres = new ArrayList<>();
        for (String genre : movie.getGenres()) {
            Genre g = Genre.newBuilder().setName(genre).build();
            genres.add(g);
        }

        //Create response
        MovieResponse response = MovieResponse.newBuilder()
                .setId(movie.getId())
                .setTitle(movie.getTitle())
                .setYear(movie.getYear())
                .setRated(movie.getRated())
                .setRuntime(movie.getRuntime())
                .setBackground(movie.getBackground())
                .setPlot(movie.getPlot())
                .setDirector(movie.getDirector())
                .setPoster(movie.getPoster())
                .setSku(movie.getMovieId())
                .setLogo(movie.getLogo())
                //Genres is list of strings
                .addAllGenres(genres)
                .build();


        //log response
        LOGGER.info("Movie response: " + response.toString());

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
