-- KKManime database schema (MySQL)
-- Run this against your own MySQL server, e.g.:
--   mysql -u root -p < kkmanime-database.sql
--
-- This is your original schema plus the two additions the app needs to run
-- fully self-hosted:
--   1. users.password_hash  — your original `users` table had no password
--      column (it was designed to pair with Supabase's managed auth, which
--      stored credentials separately). The app now hashes and checks
--      passwords itself, so it needs somewhere to store the hash.
--   2. `titles` table — the catalog table the app reads/writes for
--      anime/manga/manhwa/movie entries (in addition to its built-in seed
--      catalog in src/data/catalog.js).

CREATE DATABASE IF NOT EXISTS kkmanime;
USE kkmanime;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
    id CHAR(36) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. PROFILES
-- ============================================================
CREATE TABLE profiles (
    id CHAR(36) NOT NULL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profiles_user
        FOREIGN KEY (id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ============================================================
-- 3. COMMENTS
-- ============================================================
CREATE TABLE comments (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title_id VARCHAR(255) NOT NULL,
    title_name VARCHAR(500) NOT NULL,
    title_type VARCHAR(100) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    INDEX comments_title_idx (title_id, created_at),
    INDEX comments_user_idx (user_id)
);

-- ============================================================
-- 4. FOLLOWS
-- ============================================================
CREATE TABLE follows (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title_id VARCHAR(255) NOT NULL,
    title_name VARCHAR(500) NOT NULL,
    title_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_follows_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_user_title_follow
        UNIQUE (user_id, title_id),
    INDEX follows_user_idx (user_id),
    INDEX follows_title_idx (title_id)
);

-- ============================================================
-- 5. LIKES
-- ============================================================
CREATE TABLE likes (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title_id VARCHAR(255) NOT NULL,
    title_name VARCHAR(500) NOT NULL,
    title_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_likes_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_user_title_like
        UNIQUE (user_id, title_id),
    INDEX likes_title_idx (title_id),
    INDEX likes_user_idx (user_id)
);

-- ============================================================
-- 6. TITLES (catalog entries added/edited through SQL, on top of the
--    built-in seed catalog in src/data/catalog.js)
-- ============================================================
CREATE TABLE titles (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    name VARCHAR(500) NOT NULL,
    img TEXT,
    genres JSON NOT NULL,
    character_name VARCHAR(255) NOT NULL DEFAULT '',
    character_traits JSON NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    glyph VARCHAR(20) NOT NULL DEFAULT '',
    hue VARCHAR(50) NOT NULL DEFAULT 'steel',
    popular BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX titles_type_idx (type, sort_order)
);
