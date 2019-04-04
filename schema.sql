DROP DATABASE IF EXISTS bamazon_db;

CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_name CHAR(50) NOT NULL,
    department_name CHAR(50),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT(10)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Wireless Keyboard", "Electronics", 19.99, 50),
       ("20\" Chainsaw", "Tools", 149.99, 20),
       ("Super Smash Bros. Ultimate", "Video Games", 56.99, 300),
       ("Hot Wheels", "Toys", 5.17, 200),
       ("Wi-Fi Router", "Electronics", 56.99, 80),
       ("55\" 4K TV", "Electronics", 577.91, 25),
       ("Yoga Mat", "Sports & Outdoors", 12.99, 95),
       ("Coffee Maker", "Home & Kitchen", 79.99, 72),
       ("Cast Iron Skillet", "Home & Kitchen", 35.25, 124),
       ("Assorted Pens, 24-count", "Office Supplies", "3.43", 204);
       
       
SELECT * FROM products;