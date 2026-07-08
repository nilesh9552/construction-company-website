package com.example.construction.controller;

import com.example.construction.model.ContactDetails;
import com.example.construction.repository.ContactDetailsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    private final ContactDetailsRepository repository;

    public ContactController(ContactDetailsRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<ContactDetails> getContact() {
        ContactDetails contact = repository.findById(1L).orElseGet(() -> repository.save(new ContactDetails(
            "+91 90000 00000",
            "hello@yourcompany.com",
            "Pune, Maharashtra",
            "https://maps.google.com/"
        )));
        return ResponseEntity.ok(contact);
    }

    @PostMapping
    public ResponseEntity<ContactDetails> saveContact(@RequestBody ContactDetails contact) {
        contact.setId(1L); // Always use ID 1 for single contact record
        ContactDetails saved = repository.save(contact);
        return ResponseEntity.ok(saved);
    }
}
