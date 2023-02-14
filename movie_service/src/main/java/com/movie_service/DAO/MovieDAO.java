package com.movie_service.DAO;

import com.movie_service.models.Movie;
import com.movie_service.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Component
public class MovieDAO {
    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private MovieRepository movieRepository;

    public MovieDAO() {
    }

    public Page<Movie> findMovieByParams(String title, HashMap<String, String[]> filters, Pageable pageable) {

        System.out.println("title: " + title);

        Query query = new Query().with(pageable);
        if (title != null && title.length() > 0 && !title.equals("all")) {
            System.out.println("title: " + title);
            query.addCriteria(Criteria.where("title").regex(title, "i"));
        }

        if (filters.containsKey("genres")) {
            List<Criteria> genreCriteria = new ArrayList<>();
            for (String genre : filters.get("genres")) {
                genreCriteria.add(Criteria.where("genres").in(genre));
            }
            query.addCriteria(new Criteria().orOperator(genreCriteria.toArray(new Criteria[genreCriteria.size()])));

        }
        if (filters.containsKey("tags")) {
            List<Criteria> tagCriteria = new ArrayList<>();
            for (String tag : filters.get("tags")) {
                System.out.println("tag: " + tag);
                tagCriteria.add(Criteria.where("keywords.tag_id").is(Integer.parseInt(tag)));
            }
            query.addCriteria(new Criteria().orOperator(tagCriteria.toArray(new Criteria[tagCriteria.size()])));
        }

        if (filters.containsKey("cast")) {
            List<Criteria> castCriteria = new ArrayList<>();
            for (String cast : filters.get("cast")) {
                castCriteria.add(Criteria.where("cast.castId").in(cast));
            }
            query.addCriteria(new Criteria().orOperator(castCriteria.toArray(new Criteria[castCriteria.size()])));
        }


        Sort sort = pageable.getSort();
        mongoTemplate.useEstimatedCount(true);

        Page<Movie> page = PageableExecutionUtils.getPage(
                mongoTemplate.find(query, Movie.class, "movies"),
                pageable,
                () -> mongoTemplate.count(query, Movie.class, "movies")
        );

        return page;
    }

}
