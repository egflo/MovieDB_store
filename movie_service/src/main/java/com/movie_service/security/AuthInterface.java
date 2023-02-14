package com.movie_service.security;

import org.springframework.security.core.Authentication;

public interface AuthInterface {
    Authentication getAuthentication();
}

