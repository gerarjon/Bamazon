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
connection.connect( (err) => {
    if (err) throw err;
    console.log(`Connected as id: ${connection.threadId}\n`);
    // loads menu
    loadMenu();
})

function loadMenu() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        // displays the menu
        displayMenu(res);
    })
}

function displayMenu(products) {
    inquirer
        .prompt([{
            type: "list",
            name: "choice",
            message: "What would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit Bamazon Manager"],
            validate: function(input) {
                return !isNaN(input);
            }
        }])
        .then(function(input) {
            switch (input.choice) {
                case "View Products for Sale":
                    listItems(products);
                    break;
                case "View Low Inventory":
                    viewLowInventory();
                    break;
                case "Add to Inventory":
                    addToInventory(products);
                    break;
                case "Add New Product":
                    askNewProduct(products);
                    break;
                case "Exit Bamazon Manager":
                    exit();
                    break;
            };
        });
}

// Function that displays all the items in the store
function listItems() {
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw err;
        // display table of items
        console.table(res);
        displayMenu(res);
    })
}

// Function that displays all the items that have stock quantity <= 5
function viewLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity <= 5", function(err, res) {
        if (err) throw err;
        console.table(res);
        displayMenu(res);
    })
}

// Function that asks the user how much of a product they would like to add
function addToInventory(products) {
    console.table(products);
    inquirer
        .prompt([{
            type: "input",
            name: "choice",
            message: "What is the ID of the item you would like to add to? [Press 'Q' to exit]",
            validate: function(input) {
                return !isNaN(input) || input.toLowerCase() === "q";
            }
        }])
        .then(function(input) {
            // Checks if they want to exit
            exit2(input.choice);
            var choiceId = parseInt(input.choice);
            // checks if the item is available
            var product = checkInventory(choiceId, products);
            // if available, will ask for quantity
            if (product) {
                console.log(`\nYou have chosen ${product.product_name}.\n`)
                promptForQuantity(product);
            } else {
                console.log("That item is not in the inventory.")
                console.log("");
                listItems();
            }
        })
}

// Prompts Manager for the amount of the product they would like to add
function promptForQuantity(product) {
    inquirer
        .prompt([{
            type: "input",
            name: "quantity",
            message: "How much would you like to add? [Press 'Q' to exit]",
            validate: function(input) {
                return input > 0 || input.toLowerCase() === "q";
            }
        }])
        .then(function(val){
            exit2(val.quantity)
            var quantity = parseInt(val.quantity);
            updateStock(product, quantity);
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

// Function that updates the stock of the item
function updateStock(product, quantity) {
    connection.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?", [quantity, product.item_id], 
    function(err, res) {
        if (err) throw err;
        console.log(`\nThe quantity of ${product.product_name} has been updated.\n`);
        loadMenu();
    })
}


// Function that adds a new item into the inventory
function askNewProduct(product) {
    inquirer
        .prompt([{
            type: "input",
            name: "product_name",
            message: "What is the item you would like to add?"
        }, {
            type: "list",
            name: "department_name",
            choices: getDepartments(product),
            message: "What is the department name of the item?"
        }, {
            type: "input",
            name: "price",
            message: "What is the price of the item?",
            validate: function(input) {
                return input > 0;
            }
        }, {
            type: "input",
            name: "stock_quantity",
            message: "How much of the item would you like to add?",
            validate: function(input) {
                return !isNaN(input);
            }
        }])
        .then(addNewProduct);
}

function addNewProduct(input) {
    connection.query("INSERT INTO products (product_name, stock_quantity, price, department_name) VALUES (?, ?, ?, ?)", [input.product_name, input.stock_quantity, input.price, input.department_name], 
    function(err, res) {
        if (err) throw err;
        console.log(`\n${input.product_name} has been added to the inventory.\n`)
        loadMenu();
    })
}

// Function that checks if the user wants to quit Bamazon
function exit() {
    console.log(`\nYou have exited Bamazon Manager.\n`);
    process.exit(0);
}

function exit2(input) {
    if (input.toLowerCase() === "q") {
        console.log(`\nThank you for shopping with Bamazon!\n`)
        process.exit(0);
    }
}

// Function that gets the departments that already exists
function getDepartments(products) {
    var departments = [];
    for (var i = 0; i < products.length; i++) {
        if (departments.indexOf(products[i].department_name) === -1) {
            departments.push(products[i].department_name);
        }
    }
    return departments;
}