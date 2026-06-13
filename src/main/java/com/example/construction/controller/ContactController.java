package com.example.construction.controller;

import com.example.construction.model.ContactInfo;
import com.example.construction.repository.ContactInfoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    private final ContactInfoRepository repository;

    public ContactController(ContactInfoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<ContactInfo> getContact() {
        ContactInfo contact = repository.findById(1L).orElseGet(() -> repository.save(new ContactInfo(
            "+91 90000 00000",
            "hello@yourcompany.com",
            "Pune, Maharashtra",
            "https://maps.google.com/"
        )));
        return ResponseEntity.ok(contact);
    }

    @PostMapping
    public ResponseEntity<ContactInfo> saveContact(@RequestBody ContactInfo contact) {
        contact.setId(1L); // Always use ID 1 for single contact record
        ContactInfo saved = repository.save(contact);
        return ResponseEntity.ok(saved);
    }
}
