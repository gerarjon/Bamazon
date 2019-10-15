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
            message: "What is the ID of the item that you would like to purchase?",
            validate: function(input) {
                return !isNaN(input);
            }
        }])
        .then(function(input){
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

function promptForQuantity(product) {
    inquirer
        .prompt([{
            type: "input",
            name: "quantity",
            message: "How many would you like to order?",
            validate: function(input) {
                return input > 0;
            }
        }])
        .then(function(val){
            var quantity = parseInt(val.quantity);
            if (quantity > product.stock_quantity) {
                console.log(`We do not have that much stock for that item.\nPlease try again.`)
                listItems();
            } else {
                makePurchase(product, quantity);
            }
        })
}

function makePurchase(product, quantity) {
    connection.query("UPDATE products SET stock_quantity = stock_quantity - ?, WHERE item_id = ?", [quantity, product.item_id],
    function(err, res){
        if (err) throw err;
        console.log(`Your purchase of ${quantity} ${product.product_name} has been made!`)
        listItems();
    })
} 

function checkInventory(choiceId, inventory) {
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].item_id == choiceId) {
            return inventory[i];
        }
    }
    return null;
}
