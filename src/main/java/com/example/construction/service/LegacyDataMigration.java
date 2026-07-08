package com.example.construction.service;

import com.example.construction.model.ContactDetails;
import com.example.construction.model.HeroBackground;
import com.example.construction.repository.ContactDetailsRepository;
import com.example.construction.repository.HeroBackgroundRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@Component
public class LegacyDataMigration implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(LegacyDataMigration.class);

    private final JdbcTemplate jdbcTemplate;
    private final ContactDetailsRepository contactDetailsRepository;
    private final HeroBackgroundRepository heroBackgroundRepository;
    private final String legacyUploadDir;

    public LegacyDataMigration(JdbcTemplate jdbcTemplate,
                               ContactDetailsRepository contactDetailsRepository,
                               HeroBackgroundRepository heroBackgroundRepository,
                               @Value("${APP_UPLOAD_DIR:uploads}") String legacyUploadDir) {
        this.jdbcTemplate = jdbcTemplate;
        this.contactDetailsRepository = contactDetailsRepository;
        this.heroBackgroundRepository = heroBackgroundRepository;
        this.legacyUploadDir = legacyUploadDir;
    }

    @Override
    public void run(ApplicationArguments args) {
        migrateContactInfo();
        migrateHeroBackground();
    }

    private void migrateContactInfo() {
        if (contactDetailsRepository.existsById(1L)) {
            log.info("Contact details already exist, skipping legacy contact_info migration.");
            return;
        }

        try {
            Map<String, Object> row = jdbcTemplate.queryForMap(
                    "SELECT id, phone, email, address, map_url FROM contact_info WHERE id = 1");
            if (row.isEmpty()) {
                log.info("Legacy contact_info table found but no record with id=1.");
                return;
            }

            String phone = toString(row.get("phone"));
            String email = toString(row.get("email"));
            String address = toString(row.get("address"));
            String mapUrl = toString(row.get("map_url"));
            if (mapUrl == null || mapUrl.isBlank()) {
                mapUrl = toString(row.get("mapUrl"));
            }

            ContactDetails contact = new ContactDetails(phone, email, address, mapUrl);
            contactDetailsRepository.save(contact);
            log.info("Migrated legacy contact_info to contact_details.");
        } catch (DataAccessException ex) {
            log.info("No legacy contact_info migration necessary: {}", ex.getMessage());
        }
    }

    private void migrateHeroBackground() {
        if (heroBackgroundRepository.existsById(1L)) {
            log.info("Hero background record already exists, skipping legacy migration.");
            return;
        }

        try {
            Path file = Paths.get(legacyUploadDir, "hero-background.txt");
            if (!Files.exists(file)) {
                log.info("No legacy hero-background.txt file found at {}.", file.toAbsolutePath());
                return;
            }

            String imageUrl = Files.readString(file, StandardCharsets.UTF_8).trim();
            if (imageUrl.isBlank()) {
                log.info("Legacy hero-background.txt file is empty, skipping migration.");
                return;
            }

            HeroBackground heroBackground = new HeroBackground(imageUrl);
            heroBackgroundRepository.save(heroBackground);
            log.info("Migrated legacy hero-background.txt to hero_background table.");
        } catch (Exception ex) {
            log.warn("Could not migrate legacy hero background file: {}", ex.getMessage());
        }
    }

    private String toString(Object value) {
        return value == null ? null : value.toString();
    }
}
