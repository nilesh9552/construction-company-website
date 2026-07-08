package com.example.construction.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryStorageService {
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String uploadUrl;
    private final String apiKey;
    private final String apiSecret;
    private final String folder;
    private final boolean enabled;

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
    }

    public String saveFile(MultipartFile file) {
        if (!enabled) {
            throw new IllegalStateException("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.");
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
                throw new RuntimeException("Cloudinary upload failed with status " + response.getStatusCodeValue());
            }

            Map<String, Object> result = objectMapper.readValue(response.getBody(), Map.class);
            Object secureUrl = result.get("secure_url");
            if (secureUrl == null) {
                throw new RuntimeException("Cloudinary response did not include secure_url");
            }
            return secureUrl.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload to Cloudinary", e);
        }
    }

    private String computeSignature(String params) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
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
