package com.user_service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
public class AppRunner implements CommandLineRunner {

	private static final Logger logger = LoggerFactory.getLogger(AppRunner.class);


	private final SentimentChangeListener sentimentChangeListener;

	public AppRunner(SentimentChangeListener sentimentChangeListener) {
		this.sentimentChangeListener = sentimentChangeListener;
	}

	@Override
	public void run(String... args) throws Exception {
		// Start the sentiment change listener
		sentimentChangeListener.startChangeStream();

	}

}
