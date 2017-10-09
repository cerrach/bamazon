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
  listOptions();
});

function listOptions(){
  console.log("\n");
  inquire
    .prompt([
      {
        name: "masterList",
        type: "rawlist",
        message: "Manager Terminal",
        choices: ["Product List","Low Inventory","Add Inventory","Add Product","End Session"]
      }
    ]).then(function(userInput){

      switch(userInput.masterList) {
      case "Product List":
          getProductList();
          break;
      case "Low Inventory":
          checkLowInventory(); //write
          break;
      case "Add Inventory":
          addInventory();
          break;
      case "Add Product":
          addProduct();
          break;
      case "Exit Session":

      default:
          console.log("Goodbye..");
          connection.end();
      }

    });
  }


  function getProductList(){

    connection.query("SELECT * FROM products", function(err,result){
      if(err) throw err;
      console.log("\n");
      for(var i = 0; i < result.length; i++){
        var table = new Table();
        table.push(
          {"Item ID: " : colors.green(result[i].product_id)},
          {"Product Name: " : colors.green(result[i].product_name)},
          {"Department Name:" : colors.green(result[i].department_name)},
          {"Item Price: " : colors.green(result[i].price)},
          {"Item Stock: " : colors.green(result[i].stock_quantity)}
        );
        console.log(table.toString());

      }
      listOptions();
    });
  }

  function checkLowInventory(){
    connection.query("SELECT * FROM products WHERE stock_quantity < ?",[5],function(err,result){
        if(err) throw err;
        if(result.length === 0){
          console.log("\nNo items with low inventory\n");
        }else{
          for(var i = 0; i < result.length; i++){
            var table = new Table();
            table.push(
              {"Item ID: " : colors.green(result[i].product_id)},
              {"Product Name: " : colors.green(result[i].product_name)},
              {"Department Name:" : colors.green(result[i].department_name)},
              {"Item Price: " : colors.green(result[i].price)},
              {"Item Stock: " : colors.green(result[i].stock_quantity)}
            );
            console.log(table.toString());
          }

        }
        listOptions();
    });
  }

  function addInventory(){
    var firstQuestion;
    var secondQuestion;
    var items;
    var selectedItem;

    connection.query("SELECT * FROM products", function(err,result){
      if(err) throw err;
      items = result;
    });

    inquire
      .prompt([
        {
          name: "idSelect",
          type: "input",
          message: "Input the ID of the item to add inventory",
          validate: function(value){

            if(isNaN(parseInt(value))){
              return false;
            }

            firstQuestion = parseInt(value);
            var idArray = [];

            for(var i = 0; i < items.length; i++){
              idArray.push(items[i].product_id);
            }

            for(var i = 0; i < items.length; i++){
              if(items[i].product_id === firstQuestion){
                selectedItem = items[i];
              }
            }

            if(!(idArray.includes(parseInt(value)))){
              console.log("\nNot an item - Try again");
              return false;
            }

            return true;
          }
        },
        {
          name: "adjustInventory",
          type: "input",
          message: "How much inventory would you like to add?",
          validate: function(value){

            if(isNaN(parseInt(value))){
              return false;
            }

            secondQuestion = parseInt(value);
            return true;
          }
        }
      ]).then(function(userInput){
          connection.query("UPDATE products SET stock_quantity = ? WHERE product_id = ?",[secondQuestion + selectedItem.stock_quantity,firstQuestion],function(err,result){
            if(err) throw err;
            console.log("\n" + result.affectedRows + " products affected");
            listOptions();
          });

      });
  }

  function addProduct(){
    inquire
      .prompt([
        {
          name: "itemName",
          type: "input",
          message: "What is the name of the new product?"
        },
        {
          name: "departmentName",
          type: "input",
          message: "What is the department of the new product?"
        },
        {
          name: "priceSet",
          type: "input",
          message: "What is the price of the new product",
          validate: function(input){
            if(isNaN(parseFloat(input))){
              return false;
            }else{
              return true
            }
          }
        },
        {
          name: "stockSet",
          type: "input",
          message: "How much of this item is in stock?",
          validate: function(input){
            if(isNaN(parseInt(input))){
              return false;
            }else{
              return true
            }
          }
        }
      ]).then(function(userInput){
          connection.query("INSERT INTO products(product_name,department_name,price,stock_quantity) VALUES(?,?,?,?)",[userInput.itemName,userInput.departmentName,userInput.priceSet,userInput.stockSet],function(err,result){
            if(err) throw err;
            console.log("\n" + result.affectedRows + " products inserted");
            listOptions();
          });
      });
  }