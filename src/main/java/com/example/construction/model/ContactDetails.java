package com.example.construction.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "contact_details")
public class ContactDetails {
    @Id
    private Long id = 1L; // Single record

    private String phone;
    private String email;
    private String address;

    @Column(name = "map_url")
    private String mapUrl;

    public ContactDetails() {
        this.id = 1L;
    }

    public ContactDetails(String phone, String email, String address, String mapUrl) {
        this.id = 1L;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.mapUrl = mapUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getMapUrl() {
        return mapUrl;
    }

    public void setMapUrl(String mapUrl) {
        this.mapUrl = mapUrl;
    }
}
