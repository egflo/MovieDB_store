package com.user_service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig  {

    @Value("${app.firebase.service-account}")
    private Resource serviceAccount;

    @PostConstruct
    public FirebaseApp firebaseApp() throws IOException {

        if (!serviceAccount.exists()) {
            throw new IOException("Firebase service account not found at " + serviceAccount
                    + ". See secrets/README.md.");
        }

        try (InputStream in = serviceAccount.getInputStream()) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(in))
                    .build();
            return FirebaseApp.initializeApp(options);
        }
    }
}
