package com.example.construction.service;

import com.example.construction.model.HeroBackground;
import com.example.construction.repository.HeroBackgroundRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class HeroBackgroundService {
    private static final Logger log = LoggerFactory.getLogger(HeroBackgroundService.class);

    private final HeroBackgroundRepository heroBackgroundRepository;

    public HeroBackgroundService(HeroBackgroundRepository heroBackgroundRepository) {
        this.heroBackgroundRepository = heroBackgroundRepository;
    }

    public String getHeroBackgroundUrl() {
        return heroBackgroundRepository.findById(1L)
                .map(HeroBackground::getImageUrl)
                .orElse("");
    }

    public void saveHeroBackgroundUrl(String imageUrl) {
        try {
            HeroBackground heroBackground = new HeroBackground(imageUrl);
            heroBackgroundRepository.save(heroBackground);
        } catch (Exception e) {
            log.warn("Failed to save hero background URL: {}", e.getMessage());
        }
    }
}
