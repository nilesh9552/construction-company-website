package com.example.construction.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class HeroBackgroundService {
    private static final Logger log = LoggerFactory.getLogger(HeroBackgroundService.class);

    private final Path settingsDir;
    private final Path heroBackgroundFile;

    public HeroBackgroundService(@Value("${app.upload-dir:/tmp/uploads}") String uploadDir) {
        Path dir = Paths.get(uploadDir);
        Path file = dir.resolve("hero-background.txt");

        try {
            Files.createDirectories(dir);
            log.info("Using uploads directory: {}", dir.toAbsolutePath());
        } catch (IOException e) {
            log.warn("Unable to create configured uploads directory {}: {}. Falling back to system temp directory.", dir, e.getMessage());
            Path fallback = Paths.get(System.getProperty("java.io.tmpdir"), "uploads");
            try {
                Files.createDirectories(fallback);
                dir = fallback;
                file = dir.resolve("hero-background.txt");
                log.info("Using fallback uploads directory: {}", dir.toAbsolutePath());
            } catch (IOException ex) {
                log.error("Failed to create fallback uploads directory {}. Hero background read/write will be disabled.", fallback, ex);
            }
        }

        this.settingsDir = dir;
        this.heroBackgroundFile = file;
    }

    public String getHeroBackgroundUrl() {
        try {
            if (Files.exists(heroBackgroundFile)) {
                return Files.readString(heroBackgroundFile, StandardCharsets.UTF_8).trim();
            }
            return "";
        } catch (IOException e) {
            log.warn("Failed to read hero background setting from {}: {}", heroBackgroundFile, e.getMessage());
            return "";
        }
    }

    public void saveHeroBackgroundUrl(String imageUrl) {
        try {
            Files.writeString(heroBackgroundFile, imageUrl == null ? "" : imageUrl, StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.warn("Failed to save hero background setting to {}: {}", heroBackgroundFile, e.getMessage());
        }
    }
}
