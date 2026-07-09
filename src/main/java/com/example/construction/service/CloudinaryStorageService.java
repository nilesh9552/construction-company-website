package com.example.construction.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryStorageService {
    private static final Logger log = LoggerFactory.getLogger(CloudinaryStorageService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String uploadUrl;
    private final String apiKey;
    private final String apiSecret;
    private final String folder;
    private final boolean enabled;
    private final Path uploadDir;

    public CloudinaryStorageService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret,
            @Value("${cloudinary.folder:construction_website}") String folder) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.folder = folder;
        this.uploadUrl = cloudName == null || cloudName.isBlank()
                ? null
                : String.format("https://api.cloudinary.com/v1_1/%s/image/upload", cloudName);
        this.enabled = this.uploadUrl != null && !this.apiKey.isBlank() && !this.apiSecret.isBlank();
        this.uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException ex) {
            log.warn("Unable to create uploads directory {}: {}", this.uploadDir, ex.getMessage());
        }
    }

    public String saveFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please choose an image file.");
        }

        if (!enabled) {
            log.warn("Cloudinary is not configured; saving file locally instead.");
            return saveLocally(file);
        }

        try {
            byte[] bytes = file.getBytes();
            long timestamp = Instant.now().getEpochSecond();
            String publicId = "construction_" + UUID.randomUUID();
            String signature = computeSignature(String.format("folder=%s&public_id=%s&timestamp=%d", folder, publicId, timestamp));

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(bytes) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename();
                }
            });
            body.add("api_key", apiKey);
            body.add("timestamp", String.valueOf(timestamp));
            body.add("signature", signature);
            body.add("folder", folder);
            body.add("public_id", publicId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(uploadUrl, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                String responseBody = response.getBody() == null ? "[no body]" : response.getBody();
                log.warn("Cloudinary upload failed with status {}: {}. Falling back to local storage.", response.getStatusCodeValue(), responseBody);
                return saveLocally(file);
            }

            Map<String, Object> result = objectMapper.readValue(response.getBody(), Map.class);
            Object secureUrl = result.get("secure_url");
            if (secureUrl == null) {
                log.warn("Cloudinary response did not include secure_url. Falling back to local storage.");
                return saveLocally(file);
            }
            return secureUrl.toString();
        } catch (Exception e) {
            log.warn("Cloudinary upload failed: {}. Falling back to local storage.", e.getMessage());
            try {
                return saveLocally(file);
            } catch (IOException ioException) {
                throw new RuntimeException("Failed to upload file to Cloudinary or local storage", ioException);
            }
        }
    }

    private String saveLocally(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename();
        String safeName = UUID.randomUUID() + "_" + originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path target = uploadDir.resolve(safeName).normalize();

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        }

        return "/uploads/" + safeName;
    }

    private String computeSignature(String params) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((params + apiSecret).getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Unable to compute Cloudinary signature", e);
        }
    }
}
