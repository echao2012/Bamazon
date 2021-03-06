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
            choices: ["VIEW PRODUCTS FOR SALE", "VIEW LOW INVENTORY", "ADD TO INVENTORY", "ADD NEW PRODUCT", "EXIT"]
        }
    ]).then(function(res) {
        switch(res.menu) {
            case "VIEW PRODUCTS FOR SALE":
                getAllProducts(mainMenu);
                break;
            case "VIEW LOW INVENTORY":
                getLowInventory();
                break;
            case "ADD TO INVENTORY":
                getAllProducts(selectInventory);
                break;
            case "ADD NEW PRODUCT":
                addProduct();
                break;
            default:
                connection.end();
                break;
        }
    });
}

function getAllProducts(cb) {
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products", function(err, res) {
        if(err) throw err;

        // Display the product table
        const transformed = res.reduce((acc, {item_id, ...x}) => { acc[item_id] = x; return acc }, {});
        console.table(transformed);

        // Store the number of products
        numProducts = res.length;

        cb();
    });
}

function getLowInventory() {
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE stock_quantity < 5", function(err, res) {
        if(err) throw err;

        if (res.length <= 0) {
            console.log(chalk.red("\nNothing to display."));
        } else {
            const transformed = res.reduce((acc, {item_id, ...x}) => { acc[item_id] = x; return acc }, {});
            console.table(transformed);
        }

        mainMenu();
    })
}

function selectInventory() {
    // Ask the user the id and amount of the product to add to stock
    inquirer.prompt([
        {
            name: "id",
            message: "What is the index of the item you would like to add more stock to?",
            validate: function(value) {
                return !isNaN(value) && value > 0 && value <= numProducts;
            }
        },
        {
            name: "quantity",
            message: "How many would you like to add?",
            validate: function(value) {
                return !isNaN(value) && value >= 0;
            }
        }
    ]).then(function(res) {
        addInventory(res.id, res.quantity);
    });
}

function addInventory(itemId, addQuantity) {
    // Get the amount in stock
    connection.query("SELECT * FROM products WHERE item_id = ?", itemId, function(err, resSelect) {
        if(err) throw err;
        
        const item = resSelect[0];
        const total = parseInt(item.stock_quantity) + parseInt(addQuantity);

        // Add to the amount in stock
        connection.query("UPDATE products SET ? WHERE ?",
            [
                {
                    stock_quantity: total
                },
                {
                    item_id: itemId
                }
            ],
            function(err, resUpdate) {
                if(err) throw err;
                console.log(chalk.green("\nYou added " + addQuantity + " of " + item.product_name));
                console.log(chalk.green("The new amount in stock is " + total));
                mainMenu();
            });
    })
}

function addProduct() {
    // Ask to enter product info
    inquirer.prompt([
        {
            name: "product_name",
            message: "What is the name of the product?",
            validate: function(value) {
                return value != "";
            }
        },
        {
            name: "department_name",
            message: "What is the name of the department for this product?",
            validate: function(value) {
                return value != "";
            }
        },
        {
            name: "price",
            message: "What is the price of this product?",
            validate: function(value) {
                return !isNaN(value) && value >= 0;
            }
        },
        {
            name: "stock_quantity",
            message: "How many are there in stock?",
            validate: function(value) {
                return !isNaN(value) && value >= 0;
            }
        }
    ]).then(function(resInquirer) {
        connection.query("INSERT INTO products SET ?", resInquirer, function(err, resQuery) {
            if(err) throw err;
            console.log(chalk.green("\nAdded " + resInquirer.product_name + " to inventory"));
            mainMenu();
        });
    })
}