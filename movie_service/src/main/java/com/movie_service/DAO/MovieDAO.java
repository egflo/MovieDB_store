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
import java.util.Optional;

@Component
public class MovieDAO {
    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private MovieRepository movieRepository;

    public MovieDAO() {
    }

    public Page<Movie> findMovieByParams(Optional<String> title, HashMap<String, String[]> filters, Pageable pageable) {

        Query query = new Query().with(pageable);
        List<Criteria> allCriteria = new ArrayList<>();

        if (title.isPresent()) {
            System.out.println("title: " + title);
            allCriteria.add(Criteria.where("title").regex(title.get(), "i"));

            //query.addCriteria(Criteria.where("title").regex(title.get(), "i"));
        }

        if (filters.containsKey("query")) {
            System.out.println("query: " + filters.get("query"));
            allCriteria.add(Criteria.where("title").regex(filters.get("query")[0], "i"));
            //uery.addCriteria(Criteria.where("title").regex(filters.get("query")[0], "i"));
        }

        if (filters.containsKey("genres")) {
            List<Criteria> genreCriteria = new ArrayList<>();
            for (String genre : filters.get("genres")) {
                System.out.println("genre: " + genre);
                allCriteria.add(Criteria.where("genres").in(genre));
            }
            // query.addCriteria(new Criteria().andOperator(genreCriteria.toArray(new Criteria[genreCriteria.size()])));
        }
        if (filters.containsKey("year")) {
            System.out.println("year: " + filters.get("year"));
            allCriteria.add(Criteria.where("year").is(Integer.parseInt(filters.get("year")[0])));
        }

        if (filters.containsKey("tags")) {
            List<Criteria> tagCriteria = new ArrayList<>();
            for (String tag : filters.get("tags")) {
                System.out.println("tag: " + tag);
                allCriteria.add(Criteria.where("keywords.tag_id").is(Integer.parseInt(tag)));
                //tagCriteria.add(Criteria.where("keywords.tag_id").is(Integer.parseInt(tag)));
            }
            //query.addCriteria(new Criteria().andOperator(tagCriteria.toArray(new Criteria[tagCriteria.size()])));
        }

        if (filters.containsKey("cast")) {
            List<Criteria> castCriteria = new ArrayList<>();
            for (String cast : filters.get("cast")) {
                castCriteria.add(Criteria.where("cast.castId").in(cast));
            }
            query.addCriteria(new Criteria().andOperator(castCriteria.toArray(new Criteria[castCriteria.size()])));
        }

        // Apply all criteria together if any exist
        if (!allCriteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(allCriteria.toArray(new Criteria[0])));
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
