package com.movie_service.repository;


import com.movie_service.models.CastDetail;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("CastRepository")

public interface CastRepository extends MongoRepository<CastDetail, ObjectId> {

    Page<CastDetail> getCastDetailByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<CastDetail> findCastDetailByDobAfter(String date, Pageable pageable);
    Optional<CastDetail> findCastDetailByCastId(String id);

}
