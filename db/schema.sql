-- Users table
CREATE TABLE users (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Age INTEGER,
    Email TEXT NOT NULL UNIQUE, 
    Password TEXT NOT NULL
);

CREATE TABLE users_temp (
    Name TEXT NOT NULL,
    Age INTEGER,
    Email TEXT NOT NULL UNIQUE, 
    Password TEXT NOT NULL
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
    product_id INTEGER,
    status TEXT CHECK(status IN ('ACTIVE', 'CHECKOUT')),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY(user_id) REFERENCES users(ID),
    FOREIGN KEY(product_id) REFERENCES products(ID)
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

-- Load data from CSV files (assuming headers match column names)
.mode csv
.import users.csv users_temp
insert into users (name, age, email, password) select * from users_temp;

.import products.csv products_temp
insert into products (name, Category, Cost) select * from products_temp;

-- delete header row
delete from users where id = 1;
delete from products where id = 1;