package com.example.construction.repository;

import com.example.construction.model.SiteVisitBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteVisitBookingRepository extends JpaRepository<SiteVisitBooking, Long> {
    List<SiteVisitBooking> findAllByOrderByCreatedAtDesc();
}