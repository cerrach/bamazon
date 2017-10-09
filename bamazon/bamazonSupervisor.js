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
  inquire
    .prompt([
      {
        name: "menuOptions",
        type: "rawlist",
        choices: ["Department product sales", "Create new department", "Exit session"],
        message: "Supervisor Terminal"
      }
    ]).then(function(userInput){
        switch(userInput.menuOptions){
          case "Department product sales":
            departmentProductSales();
            break;
          case "Create new department":
            createDepartment();
            break;
          case "Exit session":

          default:
            console.log("Goodbye..");
            connection.end();
        }
    });
}


var table = new Table({ //making the table
  head: ["Department Id","Department Name","Overhead Costs","Product Sales","Total Profit"],
  colWidths: [20,20,20,20,20]
});




















function departmentProductSales(){

  connection.query("SELECT * FROM departments", function(err,result){ //have all the department entries now
    if(err) throw err;
    // console.log(result) //logs each individual entry






    function getSales(){
        connection.query("SELECT department_name FROM departments GROUP BY department_name", function(err,resultOther){ //getting all the unique department names



                for(var i = 0; i < resultOther.length; i++){ //for every department name

                          var selected = resultOther[i];
                          var selectedKey = selected.department_name;


                          var productSales = 0;
                          var salesArray = [];

                          connection.query("SELECT * FROM products WHERE department_name = ?",[selectedKey],function(err,resultAgain){ //find all products that have the selected department name

                                  for(var k = 0; k < resultAgain.length; k++){

                                    var entry;

                                      entry = resultAgain[i];
                                      console.log(entry);
                                      productSales += parseFloat(entry.product_sales); //calculate the sales for every department
                                  }




                                  var valueArray = [];
                                  result[i].department_sales
                                  Object.keys(result[i]).forEach(function(property){
                                    // console.log(entry[property]);
                                    valueArray.push(entry[property]);

                                  });


                                  // console.log(valueArray);
                                  table.push(valueArray);
                                }

                                console.log(table.toString())


                          });
                }


        });
    }

          // 
          // for(var i = 0; i < result.length; i++){
          //   var entry = result[i];
          //
          //   // console.log(entry);
          //
          //
          //
          //   var valueArray = [];
          //   result[i].department_sales
          //   Object.keys(result[i]).forEach(function(property){
          //     // console.log(entry[property]);
          //     valueArray.push(entry[property]);
          //
          //   });
          //
          //
          //   // console.log(valueArray);
          //   table.push(valueArray);
          // }
          //
          // console.log(table.toString());


    //calculate profit for each department
      //get all objects based on deparment and select product sales
      //add them all up and subtract oberhead costs
      //add attribute to individual objects

    //nested for loop that makes new array for every object and pushes to table


  });
}

function createDepartment(){
//simple insert into database
}