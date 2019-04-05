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
            choices: ["VIEW PRODUCTS FOR SALE", "VIEW LOW INVENTORY", "ADD TO INVENTORY", "ADD NEW PRODUCT", "EXIT"]
        }
    ]).then(function(res) {
        switch(res.menu) {
            case "VIEW PRODUCTS FOR SALE":
                getAllProducts();
            break;
            case "VIEW LOW INVENTORY":
                getLowInventory();
            break;
            case "ADD TO INVENTORY":
            break;
            case "ADD NEW PRODUCT":
            default:
                connection.end();
            break;
        }
    });
}

function getAllProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if(err) throw err;
        const transformed = res.reduce((acc, {item_id, ...x}) => { acc[item_id] = x; return acc}, {});
        console.table(transformed);
        mainMenu();
    });
}

function getLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
        if(err) throw err;
        const transformed = res.reduce((acc, {item_id, ...x}) => { acc[item_id] = x; return acc}, {});
        console.table(transformed);
        mainMenu();
    })
}