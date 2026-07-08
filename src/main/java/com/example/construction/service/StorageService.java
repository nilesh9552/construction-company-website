package com.example.construction.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

// Legacy local storage support has been disabled. Cloudinary is now the active storage provider.
public class StorageService {
    private static final Logger log = LoggerFactory.getLogger(StorageService.class);

    private final Path uploadDir;

    public StorageService(@Value("${app.upload-dir:uploads}") String uploadDirPath) {
        Path dir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        Path fallback = Paths.get(System.getProperty("java.io.tmpdir"), "uploads");
        Path chosen = dir;
        try {
            Files.createDirectories(chosen);
            log.info("Using uploads directory: {}", chosen);
        } catch (IOException e) {
            log.warn("Unable to create configured uploads directory {}: {}. Falling back to {}", chosen, e.getMessage(), fallback);
            try {
                Files.createDirectories(fallback);
                chosen = fallback;
                log.info("Using fallback uploads directory: {}", chosen);
            } catch (IOException ex) {
                log.error("Failed to create fallback uploads directory {}. File upload will fail.", fallback, ex);
            }
        }

        this.uploadDir = chosen;
    }

    public String saveFile(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            if (uploadDir == null) throw new IOException("No upload directory available");
            Path target = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), target);
            return "/uploads/" + fileName;
        } catch (IOException e) {
            log.error("Failed to upload file: {}", e.getMessage());
            throw new RuntimeException("Failed to upload file", e);
        }
    }
}
