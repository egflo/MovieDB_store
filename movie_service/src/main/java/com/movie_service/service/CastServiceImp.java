package com.movie_service.service;

import com.movie_service.models.Cast;

public interface CastServiceImp {

    Cast getCast(String id);

    Cast createCast(Cast cast);

    void deleteCast(String id);

    Cast updateCast(String id, Cast cast);

    Cast findByCastId(String castId);



}
