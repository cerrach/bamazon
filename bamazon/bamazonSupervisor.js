var mysql = require('mysql');
var Table = require('cli-table');
var colors = require('colors/safe');
var inquire = require('inquirer');

//connection information
var connection = mysql.createConnection({

  host: "localhost",
  port: 3306,

  user: "root",
  password: "ccbaseball14",

  database: "bamazon"

});


//connecting action
connection.connect(function(err){
  if(err) throw err;

  console.log("connected with id: " + connection.threadId);
  listOptions();
});


//main menu
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






function departmentProductSales(){

  //establishing table for function





  function tablePush(item){
    table.push(item);
  }


  connection.query("SELECT * FROM departments",function(err,result){

    if(err) throw err;
    var departmentList = [];



    for(var i = 0; i < result.length; i++){
      departmentList.push(result[i]);
    }


    // console.log(departmentList);

              connection.query("SELECT department_name from departments group by department_name",function(err,result){
                if(err) throw err;
                var departmentNames = [];
                for(var i = 0; i < result.length; i++){
                  departmentNames.push(result[i]);
                }
                // console.log(departmentNames);





                    for(var k = 0 ; k < departmentNames.length; k++){





                            connection.query("SELECT * from products where department_name = ?",[departmentNames[k].department_name],function(err,result){




                                var departmentSales = 0;
                                var totalProfit;

                                // console.log(result);

                                if(err) throw err;



                                      if(result.length){


                                            // console.log(result); //get items within select department
                                            for(var j = 0; j < result.length; j++){
                                              departmentSales += result[j].product_sales;
                                              // console.log(result[j]);
                                            }
                                            // console.log(departmentSales);

                                            for(var a = 0; a < departmentList.length; a++){
                                              if(departmentList[a].department_name == result[0].department_name){
                                                var select = departmentList[a];
                                                select.product_sales = departmentSales;
                                                select.total_profit = select.product_sales - select.over_head_costs;
                                                var valueArray = [];
                                                Object.keys(select).forEach(function(prop){
                                                  valueArray.push(select[prop]);

                                                });

                                                var table = new Table({ //making the table
                                                  head: ["Department Id","Department Name","Overhead Costs","Product Sales","Total Profit"],
                                                  colWidths: [20,20,20,20,20]
                                                });

                                                table.push(valueArray);



                                                console.log("\n" + table.toString());



                                              }
                                            }






                                      }



                              });
                    }


          });
  });



}

function createDepartment(){
  inquire
    .prompt([
      {
        name: "department_name",
        type: "input",
        message: "What is the name of the new department?"
      },
      {
        name: "department_overhead",
        type: "input",
        message: "What is the overhead cost of this department?"
      }
    ]).then(function(userInput){
      connection.query("INSERT INTO departments(department_name,over_head_costs) VALUES(?,?)",[userInput.department_name,userInput.department_overhead],function(err,result){
        if(err) throw err;
        console.log("\n" + result.affectedRows + " department inserted");
        listOptions();
      });
    });
}