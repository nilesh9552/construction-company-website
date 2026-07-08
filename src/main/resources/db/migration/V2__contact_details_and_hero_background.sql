-- Create contact_details and hero_background tables for Cloudinary migration
CREATE TABLE IF NOT EXISTS contact_details (
  id BIGINT PRIMARY KEY,
  phone VARCHAR(255),
  email VARCHAR(255),
  address VARCHAR(1024),
  map_url VARCHAR(1024)
);

CREATE TABLE IF NOT EXISTS hero_background (
  id BIGINT PRIMARY KEY,
  image_url VARCHAR(1024)
);
