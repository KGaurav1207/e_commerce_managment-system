SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Returns;
DROP TABLE IF EXISTS Tracking;
DROP TABLE IF EXISTS Shipment;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS Order_Detail;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Wishlist_Item;
DROP TABLE IF EXISTS Wishlist;
DROP TABLE IF EXISTS Cart_Item;
DROP TABLE IF EXISTS Cart;
DROP TABLE IF EXISTS Inventory;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS Supplier;
DROP TABLE IF EXISTS Courier;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Address;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Admin;

SET FOREIGN_KEY_CHECKS = 1;

CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

CREATE TABLE Admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Address (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    street VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    zip_code VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255)
);

CREATE TABLE Courier (
    courier_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Supplier (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    admin_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id) ON DELETE SET NULL
);

CREATE TABLE Product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    image_url VARCHAR(255),
    category_id INT,
    supplier_id INT,
    admin_id INT,
    brand VARCHAR(100),
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Category(category_id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id) ON DELETE SET NULL,
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id) ON DELETE SET NULL
);

CREATE TABLE Inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL UNIQUE,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_alert INT NOT NULL DEFAULT 10,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE
);

CREATE TABLE Cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Cart_Item (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES Cart(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_product (cart_id, product_id)
);

CREATE TABLE Wishlist (
    wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Wishlist_Item (
    wishlist_item_id INT AUTO_INCREMENT PRIMARY KEY,
    wishlist_id INT NOT NULL,
    product_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wishlist_id) REFERENCES Wishlist(wishlist_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist_product (wishlist_id, product_id)
);

CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_id INT,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES Address(address_id) ON DELETE SET NULL
);

CREATE TABLE Order_Detail (
    order_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE RESTRICT
);

CREATE TABLE Review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_review_per_user (user_id, product_id)
);

CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(100),
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE
);

CREATE TABLE Shipment (
    shipment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    courier_id INT,
    tracking_number VARCHAR(100) UNIQUE,
    estimated_delivery DATETIME,
    shipment_status VARCHAR(50) DEFAULT 'processing',
    shipped_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (courier_id) REFERENCES Courier(courier_id) ON DELETE SET NULL
);

CREATE TABLE Tracking (
    tracking_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    status VARCHAR(100) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE
);

CREATE TABLE Returns (
    return_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'requested',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE RESTRICT
);

INSERT INTO Admin (name, email, password) VALUES
('Super Admin', 'admin@shopmart.com', '$2b$10$ec08g9zal7FkvyXajOpDcuc0QItcqKKCtZTwz5bRLsG9EZDYIHbxu');

INSERT INTO Category (name, description) VALUES
('Electronics', 'Latest gadgets, mobiles, laptops and more'),
('Fashion', 'Trendy clothes, shoes and accessories'),
('Home & Kitchen', 'Furniture, appliances and home decor'),
('Books', 'Fiction, non-fiction, educational and more'),
('Sports', 'Sports equipment and fitness gear');

INSERT INTO Courier (name, phone, email) VALUES
('BlueDart Express', '1800-233-1234', 'support@bluedart.com'),
('Delhivery', '1800-123-4567', 'support@delhivery.com');

INSERT INTO Supplier (name, phone, email, admin_id) VALUES
('TechWorld Suppliers', '9876543210', 'tech@supplier.com', 1),
('Fashion Hub', '9876543211', 'fashion@supplier.com', 1),
('HomeGoods Co.', '9876543212', 'home@supplier.com', 1),
('BookDepot', '9876543213', 'books@supplier.com', 1);

INSERT INTO Product
    (name, description, price, discount_price, image_url, category_id, supplier_id, admin_id, brand, rating, total_reviews, is_active)
VALUES
('Samsung Galaxy S23 Ultra', 'The ultimate Galaxy experience with 200MP camera, Snapdragon processor, and long battery life.', 124999.00, 99999.00, '/api/images/smartphone.jpeg', 1, 1, 1, 'Samsung', 4.6, 128, TRUE),
('Apple iPhone 15 Pro', 'Titanium design with A17 Pro chip and advanced camera system.', 134900.00, 119900.00, '/api/images/smartphone.jpeg', 1, 1, 1, 'Apple', 4.8, 256, TRUE),
('Sony WH-1000XM5', 'Industry-leading noise canceling headphones with 30-hour battery life.', 29990.00, 24990.00, '/api/images/bluetooth_speaker.jpeg', 1, 1, 1, 'Sony', 4.7, 89, TRUE),
('MacBook Air M2', 'Lightweight laptop powered by Apple M2 chip.', 114900.00, 109900.00, '/api/images/laptop.jpeg', 1, 1, 1, 'Apple', 4.9, 342, TRUE),
('Nike Air Max 270', 'Comfort-focused sneakers with signature Air unit.', 12995.00, 9999.00, '/api/images/sneakers.jpeg', 2, 2, 1, 'Nike', 4.5, 67, TRUE),
('Levis 501 Original Jeans', 'Classic straight fit jeans.', 4999.00, 3499.00, '/api/images/jeans.jpeg', 2, 2, 1, 'Levis', 4.3, 45, TRUE),
('Instant Pot Duo 7-in-1', 'Multi-use pressure cooker for modern kitchens.', 8999.00, 6999.00, '/api/images/cookware_set.jpeg', 3, 3, 1, 'Instant Pot', 4.6, 123, TRUE),
('Atomic Habits', 'James Clear on building better habits.', 599.00, 399.00, '/api/images/python_book.jpeg', 4, 4, 1, 'Penguin Books', 4.8, 890, TRUE);

INSERT INTO Inventory (product_id, stock_quantity, min_stock_alert) VALUES
(1, 150, 20),
(2, 89, 15),
(3, 234, 30),
(4, 67, 10),
(5, 456, 50),
(6, 789, 60),
(7, 123, 20),
(8, 1200, 100);

CREATE TABLE IF NOT EXISTS Coupon (
    coupon_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2) DEFAULT 0,
    usage_limit INT DEFAULT NULL,
    start_date DATE DEFAULT (CURRENT_DATE),
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Coupon_Usage (
    usage_id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES Coupon(coupon_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    UNIQUE KEY unique_coupon_user_order (coupon_id, user_id, order_id)
);

INSERT INTO Coupon (code, description, discount_type, discount_value, minimum_amount, usage_limit, end_date) VALUES
('WELCOME200', 'Welcome coupon for new users', 'fixed', 200.00, 500.00, 100, DATE_ADD(CURRENT_DATE, INTERVAL 6 MONTH)),
('SAVE10', 'Save 10% on your order', 'percentage', 10.00, 1000.00, 500, DATE_ADD(CURRENT_DATE, INTERVAL 3 MONTH)),
('FLAT50', 'Flat ₹50 off on orders above ₹299', 'fixed', 50.00, 299.00, 200, DATE_ADD(CURRENT_DATE, INTERVAL 2 MONTH));

SELECT 'Database schema created successfully!' AS message;
