// Require package statements
const chalk = require("chalk");
require("dotenv").config();
const inquirer = require("inquirer");
const mysql = require("mysql");

// Import MySQL database credentials
const keys = require("./keys.js");

// Holds the number of products
let numProducts;

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
            getAllProducts();
        } else {
            connection.end();
        }
    });
}

function getAllProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if(err) throw err;

        // Display the table of products
        const transformed = res.reduce((acc, {item_id, ...x}) => { acc[item_id] = x; return acc}, {});
        console.table(transformed);

        // Store the number of products
        numProducts = res.length - 1;

        selectProduct();
    });
}

function selectProduct() {
    // Ask the user for a product ID and amount they want to purchase
    inquirer.prompt([
        {
            name: "id",
            message: "What is the index of the item you would like to purchase?",
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
                    const total = purchaseQuantity * item.price;
                    console.log(chalk.green("\nYou purchased " + purchaseQuantity + " of " + item.product_name));
                    console.log(chalk.green("Your order total is $" + total.toFixed(2)));
                    mainMenu();
                });
        } else {
            console.log(chalk.red("\nInsufficient stock. Your order was canceled."));
            mainMenu();
        }
    })
}