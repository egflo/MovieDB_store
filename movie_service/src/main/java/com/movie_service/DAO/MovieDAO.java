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

    /**
     * Escape regex metacharacters so user text matches literally. Passed
     * straight to $regex, a search for "(" was an invalid pattern and a 500.
     */
    private static String literal(String text) {
        return text.replaceAll("[\\\\^$.|?*+()\\[\\]{}]", "\\\\$0");
    }

    public Page<Movie> findMovieByParams(Optional<String> title, HashMap<String, String[]> filters, Pageable pageable) {

        Query query = new Query().with(pageable);
        List<Criteria> allCriteria = new ArrayList<>();

        if (title.isPresent()) {
            allCriteria.add(Criteria.where("title").regex(literal(title.get()), "i"));

            //query.addCriteria(Criteria.where("title").regex(title.get(), "i"));
        }

        if (filters.containsKey("query")) {
            allCriteria.add(Criteria.where("title").regex(literal(filters.get("query")[0]), "i"));
            //uery.addCriteria(Criteria.where("title").regex(filters.get("query")[0], "i"));
        }

        if (filters.containsKey("genres")) {
            List<Criteria> genreCriteria = new ArrayList<>();
            for (String genre : filters.get("genres")) {
                allCriteria.add(Criteria.where("genres").in(genre));
            }
            // query.addCriteria(new Criteria().andOperator(genreCriteria.toArray(new Criteria[genreCriteria.size()])));
        }
        if (filters.containsKey("year")) {
            allCriteria.add(Criteria.where("year").is(Integer.parseInt(filters.get("year")[0])));
        }

        if (filters.containsKey("yearFrom") || filters.containsKey("yearTo")) {
            Criteria years = Criteria.where("year");
            // With no lower bound, start at 1: a few records store an unknown
            // year as 0, which "up to 1979" would otherwise include.
            years = years.gte(filters.containsKey("yearFrom") ? Integer.parseInt(filters.get("yearFrom")[0]) : 1);
            if (filters.containsKey("yearTo")) years = years.lte(Integer.parseInt(filters.get("yearTo")[0]));
            allCriteria.add(years);
        }

        if (filters.containsKey("priceMin") || filters.containsKey("priceMax") || filters.containsKey("priced")) {
            // Movie.price is a copy of the inventory price; movies without one
            // (not yet synced, or no product) are left out rather than sorting
            // first. So are the ~11k untitled stub records: they have products,
            // hence prices, so they'd otherwise sit at the end of every price.
            Criteria price = Criteria.where("price").exists(true);
            if (filters.containsKey("priceMin")) price = price.gte(Integer.parseInt(filters.get("priceMin")[0]));
            if (filters.containsKey("priceMax")) price = price.lte(Integer.parseInt(filters.get("priceMax")[0]));
            allCriteria.add(price);
            allCriteria.add(Criteria.where("title").exists(true).ne(""));
        }

        if (filters.containsKey("rated")) {
            allCriteria.add(Criteria.where("rated").in((Object[]) filters.get("rated")));
        }

        if (filters.containsKey("tags")) {
            List<Criteria> tagCriteria = new ArrayList<>();
            for (String tag : filters.get("tags")) {
                allCriteria.add(Criteria.where("keywords.tag_id").is(Integer.parseInt(tag)));
                //tagCriteria.add(Criteria.where("keywords.tag_id").is(Integer.parseInt(tag)));
            }
            //query.addCriteria(new Criteria().andOperator(tagCriteria.toArray(new Criteria[tagCriteria.size()])));
        }

        if (filters.containsKey("minVotes")) {
            allCriteria.add(Criteria.where("ratings.numOfVotes").gte(Integer.parseInt(filters.get("minVotes")[0])));
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

        // Thousands of movies share each price, and Mongo doesn't order ties
        // stably, so pages could repeat or skip movies. Break ties by _id, in
        // the same direction so the {price, _id} index still serves the sort.
        Sort.Order byPrice = pageable.getSort().getOrderFor("price");
        if (byPrice != null) {
            query.with(Sort.by(byPrice.getDirection(), "_id"));
        }

        Sort sort = pageable.getSort();
        mongoTemplate.useEstimatedCount(true);

        Page<Movie> page = PageableExecutionUtils.getPage(
                mongoTemplate.find(query, Movie.class, "movies"),
                pageable,
                // Count without the page's skip/limit. Counting the paged query
                // capped the total at one page, so clients couldn't tell how
                // many results or pages there were.
                () -> mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Movie.class, "movies")
        );

        return page;
    }

}
