// Initializing npm packages used
require("dotenv").config();
require("console.table");
var mysql = require("mysql");
var inquirer = require("inquirer");

// Initialize connection with MySQL
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: "3306",
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Creates connection with the server and loads the items in the store on completion
connection.connect( (err, res) => {
    if (err) throw err;
    console.log(`Connected as id: ${connection.threadId}\n`);
    // display items
    listItems();
})

// Function that displays all items in the store
function listItems() {
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw err;
        // display table of items
        console.table(res);
        // prompt for ID
        promptForId(res);
    })
}

// Function that prompts the customer for the ID of the item
function promptForId(inventory) {
    inquirer
        .prompt([{
            type: "input",
            name: "choice",
            message: "What is the ID of the item that you would like to purchase? [Press 'Q' to exit]",
            validate: function(input) {
                return !isNaN(input) || input.toLowerCase() === "q";
            }
        }])
        .then(function(input){
            // checks if they want to exit
            exit(input.choice);
            var choiceId = parseInt(input.choice);
            // checks if the item is available
            var product = checkInventory(choiceId, inventory);
            // if available, will ask for quantity
            if (product) {
                promptForQuantity(product);
            } else {
                console.log("That item is not in the inventory.")
                console.log("");
                listItems();
            }
        });
}

// Function that asks the customer how much of the item they would like to purchase
function promptForQuantity(product) {
    inquirer
        .prompt([{
            type: "input",
            name: "quantity",
            message: "How many would you like to order? [Press 'Q' to exit]",
            validate: function(input) {
                return input > 0 || input.toLowerCase() === "q";
            }
        }])
        .then(function(val){
            exit(val.quantity)
            var quantity = parseInt(val.quantity);
            if (quantity > product.stock_quantity) {
                console.log(`We do not have that much stock for that item.\nPlease try again.`)
                listItems();
            } else {
                makePurchase(product, quantity);
            }
        })
}

// Function that updates the inventory with current purchase
function makePurchase(product, quantity) {
    connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?", [quantity, product.item_id],
    function(err, res){
        if (err) throw err;
        console.log(`Your purchase of ${quantity} ${product.product_name} has been made!\n`);
        exitAfterPurchase();
    })
} 

//Function that checks if the item exists in the inventory
function checkInventory(choiceId, inventory) {
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].item_id == choiceId) {
            return inventory[i];
        }
    }
    return null;
}

// Function that asks if they want to exit after making a purchase
function exitAfterPurchase() {
    inquirer
        .prompt([{
            type: "input",
            name: "choice",
            message: "Would you like to make another purchase? [Press 'Y/Q']",
            validate: function(input) {
                if (input.toLowerCase() === "y") {
                    return input === "y";
                } else {
                    return input.toLowerCase() === "q";
                }
            }
        }])
        .then(function(input) {
            if (input.choice === "y") {
                listItems();
            } else {
                exit(input.choice);
            }
        })
}

// Function that checks if the user wants to quit Bamazon
function exit(input) {
    if (input.toLowerCase() === "q") {
        console.log(`Thank you for shopping with Bamazon!`)
        process.exit(0);
    }
}
