package com.example.construction.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Controller
public class UploadResourceController {
    private final Path uploadsDir;
    private final Path fallbackUploadsDir;

    public UploadResourceController(@org.springframework.beans.factory.annotation.Value("${app.upload-dir:uploads}") String uploadDirPath) {
        this.uploadsDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        this.fallbackUploadsDir = Paths.get(System.getProperty("java.io.tmpdir"), "uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadsDir);
        } catch (IOException ignored) {
            // ignore and continue
        }
        try {
            Files.createDirectories(fallbackUploadsDir);
        } catch (IOException ignored) {
            // ignore
        }
    }

    @GetMapping("/uploads/**")
    public ResponseEntity<Resource> serveUpload(HttpServletRequest request) throws IOException {
        String path = request.getRequestURI();
        String relativePath = path.startsWith("/uploads/") ? path.substring("/uploads/".length()) : "";
        String decodedPath = URLDecoder.decode(relativePath, StandardCharsets.UTF_8);

        if (decodedPath.isBlank()) {
            Resource fallback = new ClassPathResource("static/images/placeholder.svg");
            return ResponseEntity.ok()
                    .contentType(MediaType.valueOf("image/svg+xml"))
                    .body(fallback);
        }

        // try configured uploads dir first
        Path target = uploadsDir.resolve(decodedPath).normalize();
        if (target.startsWith(uploadsDir) && Files.exists(target) && Files.isRegularFile(target)) {
            Resource resource = new UrlResource(target.toUri());
            MediaType mediaType = MediaTypeFactory.getMediaType(resource).orElse(MediaType.APPLICATION_OCTET_STREAM);
            return ResponseEntity.ok().contentType(mediaType).body(resource);
        }

        // then try fallback temp uploads dir
        Path fallbackTarget = fallbackUploadsDir.resolve(decodedPath).normalize();
        if (fallbackTarget.startsWith(fallbackUploadsDir) && Files.exists(fallbackTarget) && Files.isRegularFile(fallbackTarget)) {
            Resource resource = new UrlResource(fallbackTarget.toUri());
            MediaType mediaType = MediaTypeFactory.getMediaType(resource).orElse(MediaType.APPLICATION_OCTET_STREAM);
            return ResponseEntity.ok().contentType(mediaType).body(resource);
        }

        Resource fallback = new ClassPathResource("static/images/placeholder.svg");
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("image/svg+xml"))
                .body(fallback);
    }
}
