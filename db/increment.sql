
--- Implementing DML script

-- Orders table
CREATE TABLE orders (
    ID INTEGER PRIMARY KEY AUTOINCREMENT, 
    user_id INTEGER,
    cart_id INTEGER,
    status TEXT CHECK(status IN ('ORDER_PLACED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    total_amount REAL, 
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
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
