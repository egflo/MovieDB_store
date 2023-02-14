package com.movie_service.service;


import com.movie_service.models.CastDetail;
import com.movie_service.repository.CastRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CastService {

    @Autowired
    private CastRepository repository;


    public Page<CastDetail> findAll(Pageable pageable) {
        Page<CastDetail> cast = repository.findAll(pageable);
        return cast;
    }

    public Page<CastDetail> findByName(String name, Pageable pageable) {
        return repository.getCastDetailByNameContainingIgnoreCase(name, pageable);
    }

    public Optional<CastDetail> findById(String id) {
        return repository.findById(new ObjectId(id));
    }

    public Page<CastDetail> findByDob(String date, Pageable pageable) {
        return repository.findCastDetailByDobAfter(date, pageable);
    }

    public Optional<CastDetail> findByCastId(String id) {
        return repository.findCastDetailByCastId(id);
    }
}
