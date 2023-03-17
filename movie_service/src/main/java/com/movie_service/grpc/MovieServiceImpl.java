package com.movie_service.grpc;


import com.movie_service.repository.MovieRepository;
import com.movie_service.service.MovieService;
import com.movie_service.models.Movie;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.bson.types.ObjectId;
import org.proto.grpc.MovieRequest;
import org.proto.grpc.MovieServiceGrpc;
import org.springframework.beans.factory.annotation.Autowired;
import org.proto.grpc.MovieResponse;
import org.proto.grpc.MovieServiceGrpc.MovieServiceImplBase;

import java.util.Optional;


@GrpcService
public class MovieServiceImpl extends MovieServiceGrpc.MovieServiceImplBase {

    @Autowired
    MovieRepository repository;

    @Override
    public void getMovie(MovieRequest request, StreamObserver<MovieResponse> responseObserver) {

        String id  = request.getId();
        Optional<Movie> movie = repository.getMovieById(new ObjectId(id));
        MovieResponse response = MovieResponse.newBuilder()
                .setId(movie.get().getId())
                .setTitle(movie.get().getTitle())
                .setYear(movie.get().getYear())
                .setDirector(movie.get().getDirector())
                .setPoster(movie.get().getPoster())
                .setSku(movie.get().getMovieId())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
