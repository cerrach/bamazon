var mysql = require('mysql');
var Table = require('cli-table');
var colors = require('colors/safe');
var inquire = require('inquirer');

var connection = mysql.createConnection({

  host: "localhost",
  port: 3306,

  user: "root",
  password: "ccbaseball14",

  database: "bamazon"

});

connection.connect(function(err){
  if(err) throw err;

  console.log("connected with id: " + connection.threadId);
  getProductList();
});

function getProductList(){

  connection.query("SELECT * FROM products", function(err,result){
    if(err) throw err;

    for(var i = 0; i < result.length; i++){
      var table = new Table();
      table.push(
        {"Item ID: " : colors.green(result[i].item_id)},
        {"Product Name: " : colors.green(result[i].product_name)},
        {"Department Name:" : colors.green(result[i].department_name)},
        {"Item Price: " : colors.green(result[i].price)},
        {"Item Stock: " : colors.green(result[i].stock_quantity)}
      );
      console.log(table.toString());

    }
    buyerPrompt(result);
  });
}

function buyerPrompt(items){
  // console.log(items);
  var firstQuestion;
  var selectedItem;
  inquire
    .prompt([

      {
        name: "itemSelect",
        type: "input",
        message: "Please select the item you would like to purchase",
        validate: function(value){

          if(isNaN(parseInt(value))){
            return false;
          }

          firstQuestion = parseInt(value);
          var idArray = [];

          for(var i = 0; i < items.length; i++){
            idArray.push(items[i].item_id);
          }

          if(!(idArray.includes(parseInt(value)))){
            console.log("\nNot an item - Try again");
            return false;
          }

          return true;
        }
      },

      {
        name: "quantitySelect",
        type: "input",
        message: "How many units would you like to purchase?",
        validate: function(value){

          for(var i = 0; i < items.length; i++){
            if(items[i].item_id === firstQuestion){
              selectedItem = items[i];
            }
          }

          if(selectedItem.stock_quantity < value){
            console.log("\nNot enough product to confirm purchase - Try again");
            return false;
          }

          return true;

        }
      }

    ]).then(function(userInput){
      connection.query("UPDATE products SET ? WHERE ?", [
        {
          stock_quantity: parseInt(selectedItem.stock_quantity) - parseInt(userInput.quantitySelect)
        },
        {
          item_id: selectedItem.item_id
        }
      ], function(err,result){
        if(err) throw err;
        console.log(result.affectedRows + " products updated\n");
        console.log("\nPurchase Confirmed");
        connection.query("UPDATE products SET ? WHERE item_id = ?",[{product_sales: parseInt(userInput.quantitySelect) * parseFloat(selectedItem.price)}, selectedItem.item_id],function(err,result){
          if(err) throw err;
          console.log(result.affectedRows + "product sales updated\n");
        });
        console.log("Your total transaction price: " + (parseInt(userInput.quantitySelect) * parseFloat(selectedItem.price)));
        connection.end();
      });
    });
}