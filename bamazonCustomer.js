// Require package statements
require("dotenv").config();
const inquirer = require("inquirer");
const mysql = require("mysql");

// Import MySQL database credentials
const keys = require("./keys.js");

// Create the MySQL database connection
const connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: keys.mySqlDb.user,
    password: keys.mySqlDb.pw,
    database: "bamazon_db"
});

// Connect to the DB
connection.connect(function(err) {
    if(err) throw err;
    mainMenu();
});

// Display the main menu
function mainMenu() {
    displayProducts();
}

// Show all the products
function displayProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if(err) throw err;

        // Add column titles as a row
        const colKeys = Object.keys(res[0]);
        res.unshift({
            item_id: "ID",
            product_name: "Product Name",
            department_name: "Department",
            price: "Price ($)",
            stock_quantity: "Stock Quantity"
        });

        // Determine the width of each column
        const columnWidths = colKeys.map(col => res.reduce((a, b) => a[col].toString().length > b[col].toString().length ? a : b)[col].toString().length);
        const totalWidth = columnWidths.reduce((a, b) => a + b, 0) + 16;

        // Top border of table
        console.log("\n" + "-".repeat(totalWidth));

        // Print each item
        res.forEach(function(item, index) {
            console.log(
                "| " + item.item_id + " ".repeat(columnWidths[0] - item.item_id.toString().length) + " | "
                + item.product_name + " ".repeat(columnWidths[1] - item.product_name.toString().length) + " | "
                + item.department_name + " ".repeat(columnWidths[2] - item.department_name.toString().length) + " | "
                + item.price + " ".repeat(columnWidths[3] - item.price.toString().length) + " | "
                + item.stock_quantity + " ".repeat(columnWidths[4] - item.stock_quantity.toString().length) + " |"
            )

            if (index === 0) {
                console.log("-".repeat(totalWidth));
            }
        });

        // Bottom border of table
        console.log("-".repeat(totalWidth) + "\n");
    });
}

// Return a variable amount of characters in a string
String.prototype.repeat = function(length) {
    return Array(length + 1).join(this);
};