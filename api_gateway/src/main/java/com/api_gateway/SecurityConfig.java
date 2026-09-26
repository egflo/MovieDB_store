package com.api_gateway;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.resource.OAuth2ResourceServerConfigurer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;

import java.util.List;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
@Slf4j
public class SecurityConfig {

    /**
     * GETs anyone may make without signing in: the catalogue, public reviews
     * and status pages. Everything else needs a token, so a new route is
     * private until it's added here.
     */
    private static final String[] PUBLIC_GETS = {
            "/",                                    // gateway status
            "/movie-service/**",                    // movies, cast, critics, image proxy
            "/inventory-service/product/**",        // price and stock
            "/user-service/review/**",              // user reviews
            "/user-service/comments/**",            // comments on reviews
            "/inventory-service", "/inventory-service/", "/inventory-service/health",
            "/order-service", "/order-service/", "/order-service/health",
            "/user-service", "/user-service/", "/user-service/health",
    };

    /** Actuator endpoints monitoring may read without a token. */
    private static final String[] PUBLIC_ACTUATOR = {
            "/actuator/health", "/actuator/health/**", "/actuator/info",
    };

    /**
     * Staff only (the ADMIN role). Each service serves its admin endpoints
     * from AdminController under /admin, so a new one is covered by where it
     * lives. Checked before PUBLIC_GETS so no public prefix can open one.
     */
    private static final String[] ADMIN_PATHS = {
            "/*-service/admin/**",
            "/user-claims/**",                      // granting roles
            "/actuator/**",                         // env, mappings, routes
    };

    @Bean
    public SecurityWebFilterChain SecurityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(csrf -> csrf.disable())  // Disable CSRF for API
                .authorizeExchange(auth -> auth
                        .pathMatchers("/public/**").permitAll()  // Open paths
                        .pathMatchers(HttpMethod.GET, PUBLIC_ACTUATOR).permitAll()
                        .pathMatchers(ADMIN_PATHS).hasRole("ADMIN")
                        .pathMatchers(HttpMethod.GET, PUBLIC_GETS).permitAll()
                        .anyExchange().authenticated()
                )

                // JWTConfig's decoder checks the signature, issuer and audience.
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt
                        .jwtAuthenticationConverter(firebaseRoles())))
                .build();
    }

    /**
     * Firebase custom claim {"roles": ["ADMIN", ...]} to Spring roles
     * (ROLE_ADMIN). Only the Admin SDK can set it: scripts/GrantRole.java, or
     * POST /user-claims/{uid} by an existing admin. A change reaches the
     * user's next ID token (they refresh within the hour, or sign in again).
     */
    private static ReactiveJwtAuthenticationConverterAdapter firebaseRoles() {
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        roles.setAuthoritiesClaimName("roles");
        roles.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(roles);
        return new ReactiveJwtAuthenticationConverterAdapter(converter);
    }

    // This method provides the AuthenticationManager required by Spring Security

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
