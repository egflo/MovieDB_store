package com.api_gateway;


import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.IOException;


@Configuration
public class FirebaseConfiguration {
    @Value("${app.firebase.service-account}")
    Resource serviceAccount;

    @Bean
    FirebaseAuth firebaseAuth() throws IOException {
        if (!serviceAccount.exists()) {
            throw new IOException("Firebase service account not found at " + serviceAccount
                    + ". See secrets/README.md.");
        }
        GoogleCredentials credentials;
        try (var in = serviceAccount.getInputStream()) {
            credentials = GoogleCredentials.fromStream(in);
        }
        var options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .build();
        var firebaseApp = FirebaseApp.initializeApp(options);
        return FirebaseAuth.getInstance(firebaseApp);
    }
}
