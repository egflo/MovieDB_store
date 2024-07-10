package com.order_service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;

//@Configuration
@Service
public class FirebaseConfig {

    @Value("${app.firebase.path}")
    private  String SERVICE_ACCOUNT_KEY_PATH; // Replace with your service account JSON file path
    @Value("${app.firebase.db_url}")
    private  String DATABASE_URL; // Replace with your Firebase Realtime Database URL
    @Value("${app.firebase.project_id}")
    private  String PROJECT_ID; // Replace with your Firebase project ID

    //@Bean
    @PostConstruct
    public FirebaseApp initializeFirebaseApp() throws IOException {
        FileInputStream serviceAccount = new FileInputStream( SERVICE_ACCOUNT_KEY_PATH );
        FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                //.setDatabaseUrl(DATABASE_URL)
                //.setProjectId(PROJECT_ID)
                .build();
        return FirebaseApp.initializeApp(options);
    }
}
