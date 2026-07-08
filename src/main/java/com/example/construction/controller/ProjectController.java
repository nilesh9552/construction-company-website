package com.example.construction.controller;

import com.example.construction.model.ProjectItem;
import com.example.construction.repository.ProjectItemRepository;
import com.example.construction.service.CloudinaryStorageService;
import com.example.construction.service.HeroBackgroundService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(ProjectController.class);

    private final ProjectItemRepository repository;
    private final CloudinaryStorageService storageService;
    private final HeroBackgroundService heroBackgroundService;

    public ProjectController(ProjectItemRepository repository, CloudinaryStorageService storageService, HeroBackgroundService heroBackgroundService) {
        this.repository = repository;
        this.storageService = storageService;
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

        try {
            String imageUrl = storageService.saveFile(file);
            heroBackgroundService.saveHeroBackgroundUrl(imageUrl);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to upload hero background: " + e.getMessage()));
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> create(
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "budget", required = false) String budget,
            @RequestParam(value = "timeline", required = false) String timeline,
            @RequestParam(value = "beforeImage", required = false) MultipartFile beforeImage,
            @RequestParam(value = "afterImage", required = false) MultipartFile afterImage,
            @RequestParam(value = "videoUrl", required = false) String videoUrl) {

        log.info("Saving project: title='{}', category='{}', beforeImagePresent={}, afterImagePresent={}",
                title, category, beforeImage != null && !beforeImage.isEmpty(), afterImage != null && !afterImage.isEmpty());

        ProjectItem item = new ProjectItem();
        item.setTitle(title);
        item.setCategory(category);
        item.setDescription(description);
        item.setLocation(location);
        item.setBudget(budget);
        item.setTimeline(timeline);
        item.setVideoUrl(videoUrl);

        try {
            if (beforeImage != null && !beforeImage.isEmpty()) {
                item.setBeforeImage(storageService.saveFile(beforeImage));
            }
            if (afterImage != null && !afterImage.isEmpty()) {
                item.setAfterImage(storageService.saveFile(afterImage));
            }

            ProjectItem saved = repository.save(item);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Failed to save project item", e);
            return ResponseEntity.status(500).body(Map.of("message", "Failed to save project: " + e.getMessage()));
        }
    }
}
