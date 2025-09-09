-- Create database
CREATE DATABASE store_rating_app;

-- Connect to the database
\c store_rating_app;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL CHECK (LENGTH(name) >= 20 AND LENGTH(name) <= 60),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address TEXT CHECK (LENGTH(address) <= 400),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'store_owner')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stores table
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT NOT NULL CHECK (LENGTH(address) <= 400),
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    average_rating DECIMAL(2,1) DEFAULT 0.0,
    total_ratings INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ratings table
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, store_id) -- Prevent duplicate ratings from same user
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_ratings_user_store ON ratings(user_id, store_id);

-- Create function to update store average rating
CREATE OR REPLACE FUNCTION update_store_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE stores 
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM ratings 
            WHERE store_id = COALESCE(NEW.store_id, OLD.store_id)
        ),
        total_ratings = (
            SELECT COUNT(*) 
            FROM ratings 
            WHERE store_id = COALESCE(NEW.store_id, OLD.store_id)
        )
    WHERE id = COALESCE(NEW.store_id, OLD.store_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update store ratings
CREATE TRIGGER trigger_update_store_rating_insert
    AFTER INSERT ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_store_rating();

CREATE TRIGGER trigger_update_store_rating_update
    AFTER UPDATE ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_store_rating();

CREATE TRIGGER trigger_update_store_rating_delete
    AFTER DELETE ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_store_rating();

-- Insert sample admin user (password: Admin@123)
-- You should change this password after first login
INSERT INTO users (name, email, password, address, role) VALUES 
('System Administrator Account', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQPK.w8vEWc6', '123 Admin Street, Admin City', 'admin');

-- Insert sample stores
INSERT INTO stores (name, email, address) VALUES 
('Tech Store Electronics Center', 'contact@techstore.com', '123 Technology Boulevard, Silicon Valley'),
('Green Grocers Organic Market', 'info@greengrocers.com', '456 Organic Avenue, Health District'),
('Fashion Hub Clothing Store', 'sales@fashionhub.com', '789 Style Street, Fashion District');

-- Insert sample normal users
INSERT INTO users (name, email, password, address, role) VALUES 
('John Michael Smith Johnson', 'john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQPK.w8vEWc6', '123 Main Street, Anytown', 'user'),
('Sarah Elizabeth Johnson Williams', 'sarah@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQPK.w8vEWc6', '456 Oak Avenue, Somewhere City', 'user');

-- Insert sample store owner
INSERT INTO users (name, email, password, address, role) VALUES 
('Michael Robert Store Owner', 'owner@techstore.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQPK.w8vEWc6', '123 Technology Boulevard, Silicon Valley', 'store_owner');

-- Update store owner
UPDATE stores SET owner_id = (SELECT id FROM users WHERE email = 'owner@techstore.com') WHERE email = 'contact@techstore.com';

-- Insert sample ratings
INSERT INTO ratings (user_id, store_id, rating) VALUES 
(2, 1, 5), -- John rates Tech Store 5
(3, 1, 4), -- Sarah rates Tech Store 4
(2, 2, 3), -- John rates Green Grocers 3
(3, 3, 5); -- Sarah rates Fashion Hub 5

