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
            choices: ["VIEW PRODUCTS SALES BY DEPARTMENT", "CREATE NEW DEPARTMENT", "EXIT"]
        }
    ]).then(function(res) {
        switch(res.menu) {
            case "VIEW PRODUCTS SALES BY DEPARTMENT":
                viewSales();
                break;
            case "CREATE NEW DEPARTMENT":
                addDepartment();
                break;
            default:
                connection.end();
                break;
        }
    });
}

function viewSales() {
    connection.query(`
        SELECT department_id, departments.department_name, over_head_costs, SUM(product_sales) product_sales, SUM(product_sales) - over_head_costs total_profit
        FROM departments
        LEFT JOIN products ON departments.department_name = products.department_name
        GROUP BY department_id;`,
        function(err, res) {
            if(err) throw err;

            // Display the product table
            const transformed = res.reduce((acc, {department_id, ...x}) => { acc[department_id] = x; return acc }, {});
            console.table(transformed);

            mainMenu();
        });
}

function addDepartment() {
    // Ask to enter department info
    inquirer.prompt([
        {
            name: "department_name",
            message: "What is the new department's name?",
            validate: function(value) {
                return value != "";
            }
        },
        {
            name: "over_head_costs",
            message: "What is the overhead cost of this department?",
            validate: function(value) {
                return !isNaN(value) && value >= 0;
            }
        }
    ]).then(function(resInquirer) {
        connection.query("INSERT INTO departments SET ?", resInquirer, function(err, resQuery) {
            if(err) throw err;
            console.log(chalk.green("\nAdded " + resInquirer.department_name + " to departments"));
            mainMenu();
        })
    });
}