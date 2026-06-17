package com.example.construction.controller;

import com.example.construction.model.SiteVisitBooking;
import com.example.construction.repository.SiteVisitBookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/visits")
@CrossOrigin(origins = "*")
public class SiteVisitBookingController {

    private final SiteVisitBookingRepository repository;

    public SiteVisitBookingController(SiteVisitBookingRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<SiteVisitBooking>> getVisits() {
        return ResponseEntity.ok(repository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<SiteVisitBooking> createVisit(@RequestBody SiteVisitBooking booking) {
        booking.setId(null);
        if (booking.getStatus() == null || booking.getStatus().isBlank()) {
            booking.setStatus("Pending");
        }
        return ResponseEntity.ok(repository.save(booking));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SiteVisitBooking> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return repository.findById(id)
            .map(existing -> {
                existing.setStatus(payload.getOrDefault("status", existing.getStatus()));
                return ResponseEntity.ok(repository.save(existing));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}