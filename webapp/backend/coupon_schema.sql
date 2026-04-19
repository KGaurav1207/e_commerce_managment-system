-- Coupon System Database Schema
-- Add these tables to your existing database

CREATE TABLE IF NOT EXISTS Coupon (
    coupon_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2) DEFAULT 0,
    usage_limit INT DEFAULT NULL,
    usage_count INT DEFAULT 0,
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

-- Insert some sample coupons
INSERT INTO Coupon (code, description, discount_type, discount_value, minimum_amount, usage_limit, end_date) VALUES
('WELCOME200', 'Welcome coupon for new users', 'fixed', 200.00, 500.00, 100, DATE_ADD(CURRENT_DATE, INTERVAL 6 MONTH)),
('SAVE10', 'Save 10% on your order', 'percentage', 10.00, 1000.00, 500, DATE_ADD(CURRENT_DATE, INTERVAL 3 MONTH)),
('FLAT50', 'Flat 50 off on minimum purchase', 'fixed', 50.00, 299.00, 200, DATE_ADD(CURRENT_DATE, INTERVAL 2 MONTH)),
('FIRSTORDER', 'First order discount', 'percentage', 15.00, 0.00, NULL, DATE_ADD(CURRENT_DATE, INTERVAL 1 MONTH)),
('DIWALI20', 'Diwali special - 20% off', 'percentage', 20.00, 1500.00, 1000, DATE_ADD(CURRENT_DATE, INTERVAL 1 MONTH));
