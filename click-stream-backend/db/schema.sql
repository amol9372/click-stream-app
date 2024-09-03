-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE users (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Age INTEGER,
    Email TEXT NOT NULL UNIQUE,
    Password TEXT NOT NULL,
    Address TEXT,
    City TEXT,
    Province TEXT,
    Zip TEXT
);

CREATE TABLE users_temp (
    Name TEXT NOT NULL,
    Age INTEGER,
    Email TEXT NOT NULL UNIQUE,
    Password TEXT NOT NULL,
    Address TEXT,
    City TEXT,
    Province TEXT,
    Zip TEXT
);

-- Products table
CREATE TABLE products (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Category TEXT,
    Cost REAL 
);

CREATE TABLE products_temp (
    Name TEXT NOT NULL,
    Category TEXT,
    Cost REAL 
);

-- Cart table
CREATE TABLE cart (
    ID INTEGER PRIMARY KEY AUTOINCREMENT, 
    user_id INTEGER, 
    status TEXT CHECK(status IN ('ACTIVE', 'CHECKOUT', 'ORDER_PLACED')),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(ID)
);

-- Cart Items table
CREATE TABLE cart_items (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    FOREIGN KEY(cart_id) REFERENCES cart(ID),
    FOREIGN KEY(product_id) REFERENCES products(ID),
    UNIQUE(cart_id, product_id)
);

-- Orders table
CREATE TABLE orders (
    ID INTEGER PRIMARY KEY AUTOINCREMENT, 
    user_id INTEGER,
    cart_id INTEGER,
    status TEXT CHECK(status IN ('ORDER_PLACED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    total_amount REAL, 
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method TEXT,
    FOREIGN KEY(user_id) REFERENCES users(ID),
    FOREIGN KEY(cart_id) REFERENCES cart(ID),
    UNIQUE(cart_id, status),
    UNIQUE(cart_id, user_id)
);

-- Shipping table
CREATE TABLE shipping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, 
    order_id INTEGER,
    shipping_address TEXT NOT NULL,
    tracking_no TEXT, -- Optional, depending on if you'll always have tracking numbers
    shipped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    estimated_delivery_date DATE,
    FOREIGN KEY(user_id) REFERENCES users(ID),
    FOREIGN KEY(order_id) REFERENCES orders(ID),
    UNIQUE(order_id, user_id) -- Each order should have only one shipping entry
);


------ Load data from CSV files (assuming headers match column names)
.mode csv
.import users.csv users_temp
insert into users (name, age, email, password, address, city, province, zip) select * from users_temp;

.import products.csv products_temp
insert into products (name, Category, Cost) select * from products_temp;

-- delete header row
delete from users where id = 1;
delete from products where id = 1;