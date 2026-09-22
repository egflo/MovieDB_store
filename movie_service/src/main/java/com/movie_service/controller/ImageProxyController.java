package com.movie_service.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Duration;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Fetches a remote image and returns it same-origin, so the frontend can read
 * its pixels from a canvas for palette extraction (CORS would block a direct
 * read).
 *
 * Only hosts in {@code image-proxy.allowed-hosts} are fetched. Without that,
 * anyone reaching the gateway could make this service request arbitrary URLs,
 * including internal ones. Redirects are followed by hand so every hop is
 * checked against the allowlist too; four of five hero backgrounds are
 * http:// URLs that 301 to https://.
 */
@RestController
public class ImageProxyController {

    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(10);
    private static final int MAX_REDIRECTS = 3;
    private static final int MAX_BYTES = 10 * 1024 * 1024;

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(CONNECT_TIMEOUT)
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    private final Set<String> allowedHosts;

    public ImageProxyController(
            @Value("${image-proxy.allowed-hosts:assets.fanart.tv,m.media-amazon.com,images-na.ssl-images-amazon.com,ia.media-imdb.com}")
            Set<String> allowedHosts) {
        this.allowedHosts = allowedHosts.stream()
                .map(h -> h.trim().toLowerCase(Locale.ROOT))
                .collect(Collectors.toUnmodifiableSet());
    }

    @GetMapping("/proxy-image")
    public ResponseEntity<byte[]> proxyImage(@RequestParam String url) {
        URI uri;
        try {
            uri = URI.create(url);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        if (!isAllowed(uri)) {
            return ResponseEntity.badRequest().build();
        }

        try {
            for (int hop = 0; hop <= MAX_REDIRECTS; hop++) {
                HttpRequest request = HttpRequest.newBuilder(uri)
                        .timeout(REQUEST_TIMEOUT)
                        .header("Accept", "image/*")
                        .GET()
                        .build();
                HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());

                try (InputStream body = response.body()) {
                    int status = response.statusCode();

                    if (status >= 300 && status < 400) {
                        String location = response.headers().firstValue("Location").orElse(null);
                        if (location == null) return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
                        uri = uri.resolve(location);
                        if (!isAllowed(uri)) return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
                        continue;
                    }
                    if (status != 200) {
                        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
                    }

                    String contentType = response.headers().firstValue("Content-Type").orElse("");
                    if (!contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
                        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
                    }

                    byte[] bytes = body.readNBytes(MAX_BYTES + 1);
                    if (bytes.length > MAX_BYTES) {
                        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
                    }

                    return ResponseEntity.ok()
                            .contentType(MediaType.parseMediaType(contentType))
                            .cacheControl(CacheControl.maxAge(Duration.ofDays(1)).cachePublic())
                            .body(bytes);
                }
            }
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        } catch (HttpTimeoutException e) {
            return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT).build();
        } catch (IOException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }

    private boolean isAllowed(URI uri) {
        String scheme = uri.getScheme();
        String host = uri.getHost();
        return ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))
                && host != null
                && allowedHosts.contains(host.toLowerCase(Locale.ROOT));
    }
}
