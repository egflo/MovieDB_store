package com.user_service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import java.io.IOException;
import java.io.InputStream;

import static com.google.cloud.storage.spi.v1.StorageRpc.Option.PROJECT_ID;

@Configuration
public class FirebaseConfig  {

    @Value("${app.firebase.path}")
    private  String SERVICE_ACCOUNT_PATH;

    @PostConstruct
    public FirebaseApp firebaseApp() throws IOException {

        ClassPathResource resource = new ClassPathResource(SERVICE_ACCOUNT_PATH);
        if (!resource.exists()) {
            throw new IOException("Service account file not found: " + SERVICE_ACCOUNT_PATH);
        }

        InputStream serviceAccount = resource.getInputStream();
        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();
        return FirebaseApp.initializeApp(options);
    }
}
