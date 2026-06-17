package com.example.construction.controller;

import com.example.construction.model.ProjectItem;
import com.example.construction.repository.ProjectItemRepository;
import com.example.construction.service.HeroBackgroundService;
import com.example.construction.service.StorageService;
import com.example.construction.service.S3StorageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectItemRepository repository;
    private final StorageService storageService;
    private final S3StorageService s3StorageService;
    private final HeroBackgroundService heroBackgroundService;

    public ProjectController(ProjectItemRepository repository, StorageService storageService, S3StorageService s3StorageService, HeroBackgroundService heroBackgroundService) {
        this.repository = repository;
        this.storageService = storageService;
        this.s3StorageService = s3StorageService;
        this.heroBackgroundService = heroBackgroundService;
    }

    @GetMapping
    public List<ProjectItem> getAll() {
        return repository.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/hero-background")
    public ResponseEntity<Map<String, String>> getHeroBackground() {
        return ResponseEntity.ok(Map.of("imageUrl", heroBackgroundService.getHeroBackgroundUrl()));
    }

    @PostMapping(value = "/hero-background", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadHeroBackground(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please choose an image file."));
        }

        String imageUrl = (s3StorageService != null) ? s3StorageService.saveFile(file) : storageService.saveFile(file);
        heroBackgroundService.saveHeroBackgroundUrl(imageUrl);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ProjectItem> create(
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "budget", required = false) String budget,
            @RequestParam(value = "timeline", required = false) String timeline,
            @RequestParam(value = "beforeImage", required = false) MultipartFile beforeImage,
            @RequestParam(value = "afterImage", required = false) MultipartFile afterImage,
            @RequestParam(value = "videoUrl", required = false) String videoUrl) {

        ProjectItem item = new ProjectItem();
        item.setTitle(title);
        item.setCategory(category);
        item.setDescription(description);
        item.setLocation(location);
        item.setBudget(budget);
        item.setTimeline(timeline);
        item.setVideoUrl(videoUrl);

        if (beforeImage != null && !beforeImage.isEmpty()) {
            item.setBeforeImage((s3StorageService != null) ? s3StorageService.saveFile(beforeImage) : storageService.saveFile(beforeImage));
        }
        if (afterImage != null && !afterImage.isEmpty()) {
            item.setAfterImage((s3StorageService != null) ? s3StorageService.saveFile(afterImage) : storageService.saveFile(afterImage));
        }

        return ResponseEntity.ok(repository.save(item));
    }
}
