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
VALUES ("iPhone 7", "Electronics", 99.99, 50),
       ("Chainsaw", "Tools", 149.99, 20);