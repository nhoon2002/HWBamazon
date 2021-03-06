
//TODO: validate cases of entering 0 quantity.
//TODO: npm i mysql, npm i inquirer
//TODO: Press 'Q' to quit
var mysql = require("mysql");
var inquirer = require("inquirer");


//NPM credentials NOTE: CODE WAS FOLDED TO HIDE PASSWORD
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "1075432b", //TODO: hide
    database: "Bamazon_db"
});

//Connect to mySQL
sqlConnect();
displayInitial(); //Run the initializer function.



function sqlConnect () {

  connection.connect(function(err) {
    if (err) throw err;
    console.log("Welcome to Bamazon. Here are the products we have to offer!");

  });
}



// Initializer.
function displayInitial() {

    var query = "SELECT item_id, product_name, price FROM products"; //SQL query

    connection.query(query, function(err, res) {
        console.log('');

        //TODO: TABULAR DISPLAY
        for (var i = 0; i < res.length; i++) {
            console.log("ID: " + res[i].item_id + " || Product: " + res[i].product_name + " || Price: $" + res[i].price);
        }
        // Run the prompts for product purchase
        startPrompt();

    });

}



function startPrompt() {

    inquirer.prompt([{
        name: "promptID",
        type: "input",
        message: "Please enter the ID of the item you are interested in purchasing."
            //TODO validate
    }, {
        name: "qty",
        type: "input",
        message: "How many would you like to buy?"
            //TODO validate

    }]).then(function(answers) {
        console.log('----------------------------------------------------------------');
        console.log("Processing " + answers.qty + " orders of Product #" + answers.promptID + "..............");
        console.log('----------------------------------------------------------------');

        //Check the inventory for enough stock
        checkInventory(answers.promptID, answers.qty);


    });

}




function checkInventory(id, qty) {

    connection.query("SELECT product_name, stock_quantity, price FROM products WHERE ?", {
        item_id: id
    }, function(err, res) {

        var product = res[0].product_name;
        var inventory = res[0].stock_quantity;
        var unitPrice = res[0].price;
        var Cost = qty*unitPrice;
        var totalCost = Cost.toFixed(2);

        if (qty <= inventory) {
            console.log('Great news! We have processed your order!');

            // Update mySQL database if successfully processed.
            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: inventory - qty //remaining stock
            }, {
                item_id: id
            }], function(err, res2) {
                console.log('Remaining stock of [' + product + '] = ' + parseInt(inventory - qty));
                console.log('----------------------------------------------------------------');
                console.log('Your order total comes out to: $' + totalCost);
                console.log('----------------------------------------------------------------');
                againPrompt(); //Prompt user if they'd like to make another transaction.
            });

        } else if (qty > inventory) {
            console.log('Insufficient stock! We only carry ' + inventory + ' of that product.');
            displayInitial();
        }
    });

}



// Ask user whether they'd like to make another purchase.
function againPrompt() {

  inquirer.prompt([{
    name: "again",
    type: "list",
    message: "Would you like to make another transaction?",
    choices: ["Yes", "No"]
  }]).then(function(answer) {
    if (answer.again == "Yes") {
      displayInitial(); //Run the initializer
    } else {
      console.log("Thank you for shopping at Bamazon. Come again!");
      process.exit(); //Exit the application
    }
  });

}
