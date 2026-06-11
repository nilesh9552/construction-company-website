package com.example.construction.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class StorageService {
    private final Path uploadDir;

    public StorageService(@Value("${app.upload-dir:uploads}") String uploadDirPath) {
        this.uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Unable to create uploads folder", e);
        }
    }

    public String saveFile(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path target = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), target);
            return "/uploads/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }
}
