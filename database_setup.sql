-- ============================================================
-- Pantone Mercedes - Database Setup
-- Motor: MySQL / MariaDB
-- Usuario backend: root / usal2025
-- ============================================================

CREATE DATABASE IF NOT EXISTS pantoneMercedesDB
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pantoneMercedesDB;

-- ============================================================
-- TABLA: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(100)  NOT NULL,
  last_name     VARCHAR(100)  NOT NULL,
  email         VARCHAR(191)  NOT NULL UNIQUE,
  number        VARCHAR(30)   DEFAULT NULL,
  service       VARCHAR(100)  DEFAULT NULL,
  password      VARCHAR(255)  NOT NULL,
  role          ENUM('admin','client') NOT NULL DEFAULT 'client',
  resetToken    VARCHAR(255)  DEFAULT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: galleries
-- ============================================================
CREATE TABLE IF NOT EXISTS galleries (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id       INT UNSIGNED  NOT NULL,
  title           VARCHAR(255)  NOT NULL,
  service_type    VARCHAR(100)  NOT NULL,
  description     TEXT          DEFAULT NULL,
  status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
  photos_count    INT UNSIGNED  NOT NULL DEFAULT 0,
  cover_image_url VARCHAR(500)  DEFAULT NULL,
  folder_path     VARCHAR(500)  DEFAULT NULL,
  created_by      VARCHAR(150)  DEFAULT NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_gallery_client FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: gallery_images
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_images (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  gallery_id         INT UNSIGNED  NOT NULL,
  original_filename  VARCHAR(255)  NOT NULL,
  storage_filename   VARCHAR(255)  NOT NULL,
  image_url          VARCHAR(500)  NOT NULL,
  file_path          VARCHAR(500)  NOT NULL,
  is_primary         TINYINT(1)    NOT NULL DEFAULT 0,
  upload_order       INT UNSIGNED  NOT NULL DEFAULT 0,
  is_selected        TINYINT(1)    NOT NULL DEFAULT 0,
  created_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_image_gallery FOREIGN KEY (gallery_id) REFERENCES galleries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: image_comments
-- ============================================================
CREATE TABLE IF NOT EXISTS image_comments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  gallery_id  INT UNSIGNED  NOT NULL,
  image_id    INT UNSIGNED  NOT NULL,
  user_id     INT UNSIGNED  NOT NULL,
  comment     TEXT          NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_comment_gallery FOREIGN KEY (gallery_id) REFERENCES galleries(id)  ON DELETE CASCADE,
  CONSTRAINT fk_comment_image   FOREIGN KEY (image_id)   REFERENCES gallery_images(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_user    FOREIGN KEY (user_id)    REFERENCES users(id)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: general_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS general_requests (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo        VARCHAR(100)  NOT NULL,
  user_id     INT UNSIGNED  NOT NULL,
  priority    VARCHAR(50)   NOT NULL DEFAULT 'normal',
  issue       VARCHAR(255)  NOT NULL,
  request     TEXT          NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_request_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: client_videos
-- ============================================================
CREATE TABLE IF NOT EXISTS client_videos (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED  NOT NULL,
  title               VARCHAR(255)  NOT NULL,
  description         TEXT          DEFAULT NULL,
  video_url           VARCHAR(500)  DEFAULT NULL,
  thumbnail_url       VARCHAR(500)  DEFAULT NULL,
  storage_path        VARCHAR(500)  DEFAULT NULL,
  file_name           VARCHAR(255)  DEFAULT NULL,
  original_filename   VARCHAR(255)  DEFAULT NULL,
  status              ENUM('processing','ready','delivered','pending') NOT NULL DEFAULT 'processing',
  file_size           BIGINT        DEFAULT NULL,
  duration            VARCHAR(50)   DEFAULT NULL,
  resolution          VARCHAR(50)   DEFAULT NULL,
  format              VARCHAR(50)   DEFAULT NULL,
  progress            TINYINT UNSIGNED NOT NULL DEFAULT 0,
  estimated_delivery  DATETIME      DEFAULT NULL,
  created_by          VARCHAR(150)  DEFAULT NULL,
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_video_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: stats
-- ============================================================
CREATE TABLE IF NOT EXISTS stats (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED  NOT NULL,
  userTipe            VARCHAR(50)   NOT NULL,
  action_type         VARCHAR(100)  NOT NULL,
  action_descripcion  TEXT          DEFAULT NULL,
  status              VARCHAR(50)   NOT NULL DEFAULT 'success',
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stat_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: admin_activity_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id            INT UNSIGNED  NOT NULL,
  admin_name          VARCHAR(200)  NOT NULL,
  action_type         VARCHAR(100)  NOT NULL,
  action_description  TEXT          NOT NULL,
  resource_type       VARCHAR(100)  DEFAULT NULL,
  resource_id         VARCHAR(100)  DEFAULT NULL,
  resource_name       VARCHAR(255)  DEFAULT NULL,
  ip_address          VARCHAR(50)   DEFAULT NULL,
  user_agent          VARCHAR(500)  DEFAULT NULL,
  old_values          JSON          DEFAULT NULL,
  new_values          JSON          DEFAULT NULL,
  additional_data     JSON          DEFAULT NULL,
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: company_info
-- ============================================================
CREATE TABLE IF NOT EXISTS company_info (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_name  VARCHAR(200)  NOT NULL,
  description   TEXT          DEFAULT NULL,
  email         VARCHAR(191)  DEFAULT NULL,
  phone         VARCHAR(50)   DEFAULT NULL,
  address       TEXT          DEFAULT NULL,
  social_media  JSON          DEFAULT NULL,
  logo_url      VARCHAR(500)  DEFAULT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: public_projects
-- ============================================================
CREATE TABLE IF NOT EXISTS public_projects (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255)  NOT NULL,
  description   TEXT          DEFAULT NULL,
  category      VARCHAR(100)  DEFAULT NULL,
  image_url     VARCHAR(500)  DEFAULT NULL,
  client_name   VARCHAR(200)  DEFAULT NULL,
  project_date  DATETIME      DEFAULT NULL,
  featured      TINYINT(1)    NOT NULL DEFAULT 0,
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: testimonials
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_name   VARCHAR(200)  NOT NULL,
  client_image  VARCHAR(500)  DEFAULT NULL,
  content       TEXT          NOT NULL,
  rating        TINYINT UNSIGNED NOT NULL DEFAULT 5,
  project_type  VARCHAR(100)  DEFAULT NULL,
  featured      TINYINT(1)    NOT NULL DEFAULT 0,
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: faqs
-- ============================================================
CREATE TABLE IF NOT EXISTS faqs (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question     TEXT          NOT NULL,
  answer       TEXT          NOT NULL,
  category     VARCHAR(100)  DEFAULT NULL,
  order_index  INT UNSIGNED  NOT NULL DEFAULT 0,
  status       ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: service_policies
-- ============================================================
CREATE TABLE IF NOT EXISTS service_policies (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255)  NOT NULL,
  content      TEXT          NOT NULL,
  policy_type  VARCHAR(100)  DEFAULT NULL,
  order_index  INT UNSIGNED  NOT NULL DEFAULT 0,
  status       ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- USUARIO ADMIN inicial (password: admin123 — cambialo después)
-- Hash bcrypt de "admin123"
-- ============================================================
INSERT IGNORE INTO users (first_name, last_name, email, number, service, password, role)
VALUES (
  'Admin',
  'Pantone',
  'admin@pantone.com',
  NULL,
  NULL,
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVnT2q5bHW',
  'admin'
);
