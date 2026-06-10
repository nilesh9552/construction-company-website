package com.example.construction.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class HeroBackgroundService {
    private final Path settingsDir = Paths.get("uploads");
    private final Path heroBackgroundFile = settingsDir.resolve("hero-background.txt");

    public HeroBackgroundService() {
        try {
            Files.createDirectories(settingsDir);
        } catch (IOException e) {
            throw new RuntimeException("Unable to create uploads folder", e);
        }
    }

    public String getHeroBackgroundUrl() {
        try {
            if (Files.exists(heroBackgroundFile)) {
                return Files.readString(heroBackgroundFile, StandardCharsets.UTF_8).trim();
            }
            return "";
        } catch (IOException e) {
            throw new RuntimeException("Failed to read hero background setting", e);
        }
    }

    public void saveHeroBackgroundUrl(String imageUrl) {
        try {
            Files.writeString(heroBackgroundFile, imageUrl == null ? "" : imageUrl, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save hero background setting", e);
        }
    }
}
