package com.example.construction.repository;

import com.example.construction.model.ProjectItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectItemRepository extends JpaRepository<ProjectItem, Long> {
}
