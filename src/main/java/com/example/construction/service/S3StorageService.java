package com.example.construction.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

// Legacy S3 storage support has been disabled. Cloudinary is now the active storage provider.
public class S3StorageService {

    private static final Logger log = LoggerFactory.getLogger(S3StorageService.class);

    private final S3Client s3;
    private final String bucket;
    private final boolean enabled;
    private final StorageService localStorage;

    public S3StorageService(@Value("${app.s3.enabled:false}") boolean enabled,
                            @Value("${app.s3.bucket:}") String bucket,
                            @Value("${AWS_ACCESS_KEY_ID:}") String accessKey,
                            @Value("${AWS_SECRET_ACCESS_KEY:}") String secret,
                            @Value("${AWS_REGION:us-east-1}") String region,
                            StorageService storageService) {
        this.enabled = enabled && bucket != null && !bucket.isBlank() && accessKey != null && !accessKey.isBlank();
        this.bucket = bucket;
        this.localStorage = storageService;
        if (this.enabled) {
            this.s3 = S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secret)))
                    .build();
        } else {
            this.s3 = null;
        }
    }

    public String saveFile(MultipartFile file) {
        if (!enabled) {
            // fallback to local storage
            return localStorage.saveFile(file);
        }

        try {
            String key = UUID.randomUUID() + "_" + URLEncoder.encode(file.getOriginalFilename(), StandardCharsets.UTF_8);
            PutObjectRequest req = PutObjectRequest.builder().bucket(bucket).key(key).acl("public-read").build();
            s3.putObject(req, RequestBody.fromBytes(file.getBytes()));
            return String.format("https://%s.s3.amazonaws.com/%s", bucket, key);
        } catch (IOException e) {
            log.error("S3 upload failed: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }
}