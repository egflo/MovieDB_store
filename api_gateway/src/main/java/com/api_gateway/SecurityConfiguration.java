package com.api_gateway;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
@Slf4j
public class SecurityConfiguration {
    @Bean
    public SecurityWebFilterChain configureResourceServer(ServerHttpSecurity http) throws Exception {

        // @formatter:off
        http
                .csrf().disable() //Disable CSRF for postman testing
                .cors().and()
                .authorizeExchange()
                .anyExchange().permitAll()
                //.pathMatchers("/movie-service/movie/**").permitAll()
                //.pathMatchers("/movie-service/review/**").permitAll()
                //.pathMatchers("/movie-service/cast/**").permitAll()
                //.pathMatchers("/movie-service/bookmark/**").permitAll()
                .and()
                .oauth2ResourceServer()
                .jwt();

        return http.build();
        // @formatter:on
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        //corsConfig.setAllowedOrigins(List.of("*"));
        corsConfig.setAllowedOriginPatterns(List.of("http://*:3000, https://*.vercel.app"));
        corsConfig.setMaxAge(3600L);
        corsConfig.addAllowedMethod("*");
        corsConfig.addAllowedHeader("*");
        corsConfig.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return source;
    }
}
