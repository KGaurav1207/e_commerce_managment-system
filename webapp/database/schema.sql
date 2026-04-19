-- ============================================================
-- CLEAN RESET (VERY IMPORTANT)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Returns;
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
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Address;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Admin;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- DATABASE
-- ============================================================
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- ============================================================
-- ADMIN
-- ============================================================
CREATE TABLE Admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ADDRESS
-- ============================================================
CREATE TABLE Address (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- CATEGORY
-- ============================================================
CREATE TABLE Category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- ============================================================
-- SUPPLIER
-- ============================================================
CREATE TABLE Supplier (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    admin_id INT,
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id)
);

-- ============================================================
-- PRODUCT
-- ============================================================
CREATE TABLE Product (
    prod_ID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200),
    price DECIMAL(10,2),
    category_id INT,
    supplier_id INT,
    admin_id INT,
    FOREIGN KEY (category_id) REFERENCES Category(category_id),
    FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id),
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id)
);

-- ============================================================
-- INVENTORY
-- ============================================================
CREATE TABLE Inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNIQUE,
    stock_quantity INT,
    FOREIGN KEY (product_id) REFERENCES Product(prod_ID) ON DELETE CASCADE
);

-- ============================================================
-- CART
-- ============================================================
CREATE TABLE Cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- CART ITEM
-- ============================================================
CREATE TABLE Cart_Item (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT,
    product_id INT,
    FOREIGN KEY (cart_id) REFERENCES Cart(cart_id),
    FOREIGN KEY (product_id) REFERENCES Product(prod_ID)
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- ============================================================
-- ORDER DETAIL
-- ============================================================
CREATE TABLE Order_Detail (
    order_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (product_id) REFERENCES Product(prod_ID)
);

-- ============================================================
-- REVIEW
-- ============================================================
CREATE TABLE Review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (product_id) REFERENCES Product(prod_ID)
);

-- ============================================================
-- RETURNS
-- ============================================================
CREATE TABLE Returns (
    return_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (product_id) REFERENCES Product(prod_ID)
);
-- ============================================================
-- SAMPLE DATA INSERTS
-- ============================================================

-- Admin
INSERT INTO Admin (name, email, password) VALUES
('Super Admin', 'admin@shopmart.com', '$2b$10$ec08g9zal7FkvyXajOpDcuc0QItcqKKCtZTwz5bRLsG9EZDYIHbxu');
-- password: Admin@123

-- Categories
INSERT INTO Category (name, description) VALUES
('Electronics', 'Latest gadgets, mobiles, laptops and more'),
('Fashion', 'Trendy clothes, shoes and accessories'),
('Home & Kitchen', 'Furniture, appliances and home decor'),
('Books', 'Fiction, non-fiction, educational and more'),
('Sports', 'Sports equipment and fitness gear'),
('Beauty', 'Skincare, makeup and personal care'),
('Toys', 'Kids toys, games and educational toys'),
('Grocery', 'Fresh produce, packaged food and beverages');

-- Courier
INSERT INTO Courier (name, phone, email) VALUES
('BlueDart Express', '1800-233-1234', 'support@bluedart.com'),
('Delhivery', '1800-123-4567', 'support@delhivery.com'),
('FedEx India', '1800-419-4343', 'support@fedex.in'),
('DTDC', '1800-212-4344', 'support@dtdc.com');

-- Supplier
INSERT INTO Supplier (name, phone, email, admin_id) VALUES
('TechWorld Suppliers', '9876543210', 'tech@supplier.com', 1),
('Fashion Hub', '9876543211', 'fashion@supplier.com', 1),
('HomeGoods Co.', '9876543212', 'home@supplier.com', 1),
('BookDepot', '9876543213', 'books@supplier.com', 1);

-- Products
INSERT INTO Product (name, description, price, discount_price, category_id, supplier_id, admin_id, brand, rating, total_reviews) VALUES
('Samsung Galaxy S23 Ultra', 'The ultimate Galaxy experience with 200MP camera, Snapdragon 8 Gen 2 processor, 5000mAh battery.', 124999.00, 99999.00, 1, 1, 1, 'Samsung', 4.6, 128),
('Apple iPhone 15 Pro', 'iPhone 15 Pro with titanium design, A17 Pro chip and 48MP main camera system.', 134900.00, 119900.00, 1, 1, 1, 'Apple', 4.8, 256),
('Sony WH-1000XM5', 'Industry-leading noise canceling headphones with 30-hour battery life.', 29990.00, 24990.00, 1, 1, 1, 'Sony', 4.7, 89),
('MacBook Air M2', 'Supercharged by M2 chip. With up to 18 hours battery life and stunning Liquid Retina display.', 114900.00, 109900.00, 1, 1, 1, 'Apple', 4.9, 342),
('Nike Air Max 270', 'Nike Air Max 270 featuring Airs largest heel unit yet for a super-soft ride.', 12995.00, 9999.00, 2`, 2, 1, 'Nike', 4.5, 67),
('Levi 501 Original Jeans', 'The original blue jean since 1873. Straight fit, button fly.', 4999.00, 3499.00, 2, 2, 1, 'Levis', 4.3, 45),
('Instant Pot Duo 7-in-1', 'Electric pressure cooker, slow cooker, rice cooker, steamer, saute, yogurt maker, warmer.', 8999.00, 6999.00, 3, 3, 1, 'Instant Pot', 4.6, 123),
('Atomic Habits', 'An easy and proven way to build good habits and break bad ones by James Clear.', 599.00, 399.00, 4, 4, 1, 'Penguin Books', 4.8, 890);

-- Inventory
INSERT INTO Inventory (product_id, stock_quantity, min_stock_alert) VALUES
(1, 150, 20),
(2, 89, 15),
(3, 234, 30),
(4, 67, 10),
(5, 456, 50),
(6, 789, 60),
(7, 123, 20),
(8, 1200, 100);

SELECT 'Database schema created successfully!' AS message;
