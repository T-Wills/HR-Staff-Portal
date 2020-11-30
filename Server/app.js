// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const mysql = require("mysql");

// const app = express();

// const db = mysql.createConnection({
//    host: "localhost",
//    user: "root",
//    password: "",
//    database: "staff_database"
// });

// db.connect=(error)=>{
//   if(error){
//       console.log(error)
//   }else{
//       console.log("Database Connected!");
//   }
// }

// //use middleware
// app.use(cors());
// app.use(express.json());
// app.use(bodyParser.urlencoded({extended: true})); //bodyparser is a middleware for any json related objects


// app.post("/save", (req, res)=>{
//   const {FirstName, MiddleName, LastName, DateOfBirth, MobileNumber,
//         CUGNumber, PersonalEmail, OfficialEmail, HomeAddress, MaritalStatus, 
//         EmergencyContact_Name, EmergencyContact_MobileNumber, Relationship, 
//         EmergencyContact_HomeAddress} = req.body;

//   const sqlInsert = "INSERT INTO staff-profile (FirstName, MiddleName, LastName, DateOfBirth, MobileNumber, CUGNumber, PersonalEmail, OfficialEmail, HomeAddress, MaritalStatus, EmergencyContact_Name, EmergencyContact_MobileNumber, Relationship, EmergencyContact_HomeAddress) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
//   db.query(sqlInsert, 
//     [FirstName, MiddleName, LastName, DateOfBirth, MobileNumber, CUGNumber, PersonalEmail, OfficialEmail, HomeAddress, MaritalStatus, EmergencyContact_Name, EmergencyContact_MobileNumber, Relationship, EmergencyContact_HomeAddress], 
//     (err, result) => {
//      console.log(err);
//   });
// }); 

// //Listening to server
// app.listen(3001, ()=>{
//    console.log("Listening to server at port 3001");
// });

const express = require("express");
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "staff_database"
});

db.connect=(error)=>{
   if(error){
      console.log(error)
   }else{
        console.log("Database Connected!");
   }
}

//middleware
app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));


//post request
app.post("/insert", (req, res) => {

  const {FirstName,MiddleName,LastName,DateOfBirth,MobileNumber,CUGNumber,
    PersonalEmail,OfficialEmail,HomeAddress,MaritalStatus,EmergencyContact_Name,
    EmergencyContact_MobileNumber,Relationship,EmergencyContact_HomeAddress} = req.body;
  
  const sqlInsert = "INSERT INTO staff_profile (FirstName,MiddleName,LastName,DateOfBirth,MobileNumber,CUGNumber,PersonalEmail,OfficialEmail,HomeAddress,MaritalStatus,EmergencyContact_Name,EmergencyContact_MobileNumber,Relationship,EmergencyContact_HomeAddress) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  db.query(sqlInsert, [FirstName,MiddleName,LastName,DateOfBirth,MobileNumber,CUGNumber,PersonalEmail,OfficialEmail,HomeAddress,MaritalStatus,EmergencyContact_Name,EmergencyContact_MobileNumber,Relationship,EmergencyContact_HomeAddress], (err, result) => {
      console.log(err);
  });
});

//get request
app.get("/get", (req, res) => {

  const sqlSelect = "SELECT * FROM staff_profile";
  db.query(sqlSelect,(err, result)=>{
     res.send(result);
  });
});

app.listen(3001, ()=>{
    console.log("running on port 3001");
}); 