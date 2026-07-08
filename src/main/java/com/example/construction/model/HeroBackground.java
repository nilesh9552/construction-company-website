package com.example.construction.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "hero_background")
public class HeroBackground {
    @Id
    private Long id = 1L;

    @Column(name = "image_url")
    private String imageUrl;

    public HeroBackground() {
        this.id = 1L;
    }

    public HeroBackground(String imageUrl) {
        this.id = 1L;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
