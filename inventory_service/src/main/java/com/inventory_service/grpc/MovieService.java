package com.inventory_service.service_grpc;


import net.devh.boot.grpc.client.inject.GrpcClient;
import org.proto.grpc.MovieRequest;
import org.proto.grpc.MovieResponse;
import org.proto.grpc.MovieServiceGrpc;
import org.springframework.stereotype.Service;


@Service
public class MovieService {

    @GrpcClient("movie-grpc-server")
    private MovieServiceGrpc.MovieServiceBlockingStub movieServiceBlockingStub;

    public MovieResponse getMovie(String id) {

        MovieRequest request = MovieRequest.newBuilder().setId(id).build();
        return movieServiceBlockingStub.getMovie(request);
    }
}
