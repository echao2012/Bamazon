// Require package statements
const chalk = require("chalk");

// Show all the products
function displayProducts(products) {
    if (products.length <= 0) {
        console.log(chalk.red("\nNothing to display."));
        return;
    }

    // Add column titles as a row
    const colKeys = Object.keys(products[0]);
    products.unshift({
        item_id: "ID",
        product_name: "Product Name",
        department_name: "Department",
        price: "Price ($)",
        stock_quantity: "Stock Quantity"
    });

    // Determine the width of each column
    const columnWidths = colKeys.map(col => products.reduce((a, b) => a[col].toString().length > b[col].toString().length ? a : b)[col].toString().length);
    const totalWidth = columnWidths.reduce((a, b) => a + b, 0) + 16;

    // Top border of table
    console.log("\n" + "-".repeat(totalWidth));

    // Print each item
    products.forEach(function(item, index) {
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
}

module.exports = {
    displayProducts: displayProducts
}