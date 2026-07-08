package com.example.construction.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

// Local upload resource handler no longer applies because uploads are stored in Cloudinary.
public class WebConfig implements WebMvcConfigurer {
    private final String uploadDirPath;

    public WebConfig(@Value("${app.upload-dir:uploads}") String uploadDirPath) {
        this.uploadDirPath = uploadDirPath;
    }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        Path uploadsPath = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadsPath.toUri().toString());
    }
}
