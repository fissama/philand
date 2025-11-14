-- ==========================================
--  Project: Philand (Personal Finance System)
--  Database: MySQL 8.x
--  Author: Phi Le Anh
-- ==========================================

CREATE DATABASE IF NOT EXISTS philand CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE philand;

-- ------------------------------------------
-- Users
-- ------------------------------------------
CREATE TABLE users (
    id              CHAR(36) NOT NULL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    name            VARCHAR(255),
    password_hash   VARCHAR(255),
    avatar          TEXT,
    bio             TEXT,
    timezone        VARCHAR(50) DEFAULT 'UTC',
    locale          VARCHAR(10) DEFAULT 'en',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------
-- Budgets
-- ------------------------------------------
CREATE TABLE budgets (
    id              CHAR(36) NOT NULL PRIMARY KEY,
    owner_id        CHAR(36) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    currency_code   VARCHAR(10) NOT NULL DEFAULT 'USD',
    description     TEXT,
    archived        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------
-- Budget members & roles
-- ------------------------------------------
CREATE TABLE budget_members (
    budget_id       CHAR(36) NOT NULL,
    user_id         CHAR(36) NOT NULL,
    role            ENUM('owner','manager','contributor','viewer') NOT NULL,
    PRIMARY KEY (budget_id, user_id),
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------
-- Categories
-- ------------------------------------------
CREATE TABLE categories (
    id              CHAR(36) NOT NULL PRIMARY KEY,
    budget_id       CHAR(36) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    kind            ENUM('income','expense') NOT NULL,
    is_hidden       BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (budget_id, name, kind),
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
);

-- ------------------------------------------
-- Entries (transactions)
-- ------------------------------------------
CREATE TABLE entries (
    id              CHAR(36) NOT NULL PRIMARY KEY,
    budget_id       CHAR(36) NOT NULL,
    category_id     CHAR(36) NOT NULL,
    kind            ENUM('income','expense') NOT NULL,
    amount_minor    BIGINT NOT NULL CHECK (amount_minor > 0),
    currency_code   VARCHAR(10) NOT NULL,
    entry_date      DATE NOT NULL,
    description     TEXT,
    counterparty    VARCHAR(255),
    created_by      CHAR(36) NOT NULL,
    updated_by      CHAR(36),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NULL,
    deleted_at      DATETIME NULL,
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ------------------------------------------
-- Password Resets
-- ------------------------------------------

CREATE TABLE password_resets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    reset_type ENUM('email', 'otp') NOT NULL,
    token VARCHAR(255),
    otp_code VARCHAR(6),
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_otp (otp_code),
    INDEX idx_expires (expires_at)
);
