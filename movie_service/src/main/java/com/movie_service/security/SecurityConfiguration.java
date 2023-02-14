package com.movie_service.security;

/**

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        //config.setAllowedOrigins(List.of("http://localhost:3000","https://*.vercel.app"));
        config.setAllowedOriginPatterns(List.of("http://*:3000, https://*.vercel.app"));
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.oauth2ResourceServer().jwt();
        //http = http.cors().and().csrf().disable();

        http
                .cors().and()
                .authorizeHttpRequests(authorize -> authorize
                                //.requestMatchers(CorsUtils::isPreFlightRequest).permitAll()
                        .requestMatchers(HttpMethod.GET, "/movie/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/review/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/cast/**").permitAll()
                        .requestMatchers( "/bookmark/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/review/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/review/**").authenticated()
                        .requestMatchers("/movie/**", "/auth").permitAll()
                        //.anyRequest().authenticated()
                        //.requestMatchers("/admin/**").hasRole("ADMIN")
                        //.requestMatchers("/db/**").access(new WebExpressionAuthorizationManager("hasRole('ADMIN') and hasRole('DBA')"))
                        .anyRequest().permitAll()
                );


        return http.build(); //BUILDER PATTERN
    }


}

 **/