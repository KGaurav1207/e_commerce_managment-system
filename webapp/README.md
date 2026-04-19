# 🛒 ShopMart - E-Commerce Management System

A full-stack e-commerce platform built with **React.js**, **Node.js/Express**, and **MySQL**.

---

## 📁 Project Structure

```
webapp/
├── frontend/        ← React.js Frontend (All UI pages)
├── backend/         ← Node.js + Express API Server
└── database/        ← MySQL Schema & Seed Data
```

---

## 🚀 Quick Setup Guide

### Step 1: Database Setup (MySQL)

Open MySQL CLI or MySQL Workbench and run:
```sql
-- Run the complete schema file
SOURCE /path/to/webapp/database/schema.sql;
```
Or paste the SQL from `database/schema.sql` directly.

This creates all 19 tables and sample data.

If MySQL is already running and you want to initialize the schema from the backend folder instead, run:
```bash
cd webapp/backend
npm run db:init
```

**Default Admin Login:**
- Email: `admin@shopmart.com`
- Password: `Admin@123`

---

### Step 2: Backend Setup

```bash
cd webapp/backend

# Configure environment (already set for MySQL user=gaurav, password=root)
# Edit .env if needed:
# DB_HOST=localhost
# DB_USER=gaurav
# DB_PASSWORD=root
# DB_NAME=ecommerce_db

# Install dependencies
npm install

# Start the backend server
npm start
# OR for development (auto-reload):
npm run dev
```

Backend runs on: **http://localhost:5000**

---

### Step 3: Frontend Setup

```bash
cd webapp/frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on: **http://localhost:3000**

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/admin/login` | Admin login |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/cart` | Add to cart |
| GET | `/api/cart` | Get cart items |
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | Order history |
| GET | `/api/admin/dashboard` | Admin stats |

Full API: http://localhost:5000/api/health

---

## 🎨 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, categories, featured products |
| Products | `/products` | Browse with filters & search |
| Product Detail | `/products/:id` | Images, reviews, add to cart |
| Login | `/login` | User authentication |
| Register | `/register` | New user signup |
| Cart | `/cart` | Shopping cart management |
| Checkout | `/checkout` | Address + payment + order |
| Wishlist | `/wishlist` | Saved products |
| Orders | `/orders` | Order history |
| Order Detail | `/orders/:id` | Tracking + details |
| Profile | `/profile` | Account management |
| Admin | `/admin` | Dashboard, products, orders |

---

## 🗄️ Database Tables (19 Tables)

- **Users, Admin, Supplier** — Authentication & user management
- **Product, Category, Inventory** — Product catalog
- **Cart, Cart_Item, Wishlist, Wishlist_Item** — Shopping features
- **Orders, Order_Detail, Payment** — Order management
- **Shipment, Tracking, Courier** — Delivery tracking
- **Review, Address, Returns** — Reviews & addresses

---

## 🛡️ Security

- Passwords hashed with **bcrypt (10 rounds)**
- Authentication via **JWT tokens** (7-day expiry)
- Admin routes protected with role-based middleware
- CORS configured for frontend origin

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Axios |
| Backend | Node.js, Express.js, JWT, bcrypt |
| Database | MySQL 8.x with mysql2 driver |
| UI | Custom CSS, Font Awesome, Google Fonts |

---

## 📞 Support

For issues, check backend logs: `npm run dev` shows detailed error messages.
