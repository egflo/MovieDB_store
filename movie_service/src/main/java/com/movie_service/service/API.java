package com.movie_service.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.movie_service.models.Movie;
import com.movie_service.repository.MovieRepository;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.HttpURLConnection;
import java.net.URL;


public class API { ;

    private MovieRepository repository;

    API(MovieRepository repository) {
        this.repository = repository;
    }

    //@Value("${background_api.key}")
    String API_KEY = "";

    public int background(String movie_id)  {
        int row_ratings, row_movie = 0;

        try {

            Movie movie = repository.getMovieByMovieId(movie_id).get();

            String movie_background = movie.getBackground();

            if (movie_background != null && movie_background.length() > 0) {
                //return 0;
            }

            // Create a neat value object to hold the URL
            URL url = new URL("https://webservice.fanart.tv/v3/movies/" + movie_id + "?api_key=" + API_KEY);

            System.out.println(url.toString());

            // Open a connection(?) on the URL(??) and cast the response(???)
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            // Now it's "open", we can set the request method, headers etc.
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Accept", "application/json");
            connection.setDoOutput(true);

            // This line makes the request
            InputStream responseStream = connection.getInputStream();

            // Manually converting the response body InputStream to String
            String content = IOUtils.toString(responseStream, "UTF-8");

            // Finally we have the response
            JsonObject json = new JsonParser().parse(content).getAsJsonObject();
            JsonArray data = json.get("moviebackground").getAsJsonArray();
            JsonArray posters = json.get("movieposter").getAsJsonArray();

            if(data.size() != 0) {
                JsonObject object = data.get(0).getAsJsonObject();
                JsonObject poster = posters.get(0).getAsJsonObject();

                JsonElement poster_url = poster.get("url");
                JsonElement background_url = object.get("url");


                System.out.println("URL " + background_url.getAsString());
                System.out.println("Poster " + poster_url.getAsString());

                movie.setBackground(background_url.getAsString());
                movie.setPoster(poster_url.getAsString());

                repository.save(movie);

            }

            else {
                return 0;
            }

            //connection.commit();

        }
        catch (Exception e) {
            e.printStackTrace();
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            String exceptionAsString = sw.toString();
            //System.out.println(exceptionAsString);
            System.out.println("ERROR MOVIE ID " + movie_id);

        }

        return row_movie;

    }

}
