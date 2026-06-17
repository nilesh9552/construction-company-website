-- Initial schema for production
CREATE TABLE IF NOT EXISTS site_visit_bookings (
  id BIGSERIAL PRIMARY KEY,
  client_name VARCHAR(255),
  phone VARCHAR(100),
  email VARCHAR(255),
  visit_date DATE,
  visit_time TIME,
  site_address TEXT,
  message TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_item (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255),
  category VARCHAR(255),
  description TEXT,
  location VARCHAR(255),
  budget VARCHAR(100),
  timeline VARCHAR(255),
  before_image VARCHAR(1024),
  after_image VARCHAR(1024),
  video_url VARCHAR(1024)
);
