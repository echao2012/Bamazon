// Require package statements
const chalk = require("chalk");
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

function mainMenu() {
    console.log();
    inquirer.prompt([
        {
            name: "menu",
            message: "What would you like to do?",
            type: "list",
            choices: ["SHOP", "EXIT"]
        }
    ]).then(function(res) {
        if(res.menu === "SHOP") {
            displayProducts();
        } else {
            connection.end();
        }
    })
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
            if (index === 0) {
                color = "yellow"
            } else if(index % 2 === 0) {
                color = "cyan"
            } else {
                color = "white"
            }

            console.log(chalk[color](
                chalk.white("| ") + item.item_id + " ".repeat(columnWidths[0] - item.item_id.toString().length) + chalk.white(" | ")
                + item.product_name + " ".repeat(columnWidths[1] - item.product_name.toString().length) + chalk.white(" | ")
                + item.department_name + " ".repeat(columnWidths[2] - item.department_name.toString().length) + chalk.white(" | ")
                + item.price + " ".repeat(columnWidths[3] - item.price.toString().length) + chalk.white(" | ")
                + item.stock_quantity + " ".repeat(columnWidths[4] - item.stock_quantity.toString().length) + chalk.white(" |")
            ));

            if (index === 0) {
                console.log("-".repeat(totalWidth));
            }
        });

        // Bottom border of table
        console.log("-".repeat(totalWidth) + "\n");

        selectProduct(res.length - 1);
    });
}

function selectProduct(numProducts) {
    // Ask the user for a product ID and amount they want to purchase
    inquirer.prompt([
        {
            name: "id",
            message: "What is the ID of the item you would like to purchase?",
            validate: function(value) {
                return !isNaN(value) && value > 0 && value <= numProducts;
            }
        },
        {
            name: "quantity",
            message: "How many would you like to purchase?",
            validate: function(value) {
                return !isNaN(value) && value > 0;
            }
        }
    ]).then(function(res) {
        purchaseProduct(res.id, res.quantity);
    })
}

function purchaseProduct(itemId, purchaseQuantity) {
    // Get the amount in stock
    connection.query("SELECT * FROM products WHERE item_id = ?", itemId, function(err, resSelect) {
        if(err) throw err;
        
        const item = resSelect[0];

        // Check that there is enough in stock
        if(item.stock_quantity >= purchaseQuantity) {
            // Remove the amount purchased from the amount in stock
            connection.query("UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: item.stock_quantity - purchaseQuantity
                    },
                    {
                        item_id: itemId
                    }
                ],
                function(err, resUpdate) {
                    if(err) throw err;
                    console.log(chalk.green("\nYou purchased " + purchaseQuantity + " of " + item.product_name));
                    console.log(chalk.green("Your order total is $" + purchaseQuantity * item.price));
                    mainMenu();
                });
        } else {
            console.log(chalk.red("\nInsufficient stock. Your order was canceled."));
            mainMenu();
        }
    })
}

// Return a variable amount of characters in a string
String.prototype.repeat = function(length) {
    return Array(length + 1).join(this);
};