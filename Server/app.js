const express = require("express");
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require('bcrypt');
const round = 10;
const jwt = require('jsonwebtoken');
const { response } = require("express");


const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "hr_portal"
});

const verifyJWT = (req, res, next) =>{
  token = req.headers["x-access-token"];
  if(!token){
      res.send("token needed");
  }
  else {
      jwt.verify(token, "secret", (err, decoded)=>{
          if (err){
              res.json({auth: false, message: "failed"})
          } else {
              req.userId = decoded.id;
              next();
          }
      })
  }
}

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
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  parameterLimit: 100000,
  extended: true 
}));


app.get("/user", verifyJWT ,(req, res)=>{
  const id = req.userId
     const sqlSelect = "SELECT * FROM staff_profile WHERE OfficialEmail = ?";
     db.query(sqlSelect, id, (err, result) => {
         res.send(result);
     });
  });

//get request
app.get("/get", (req, res) => {
  const sqlSelect = "SELECT * FROM staff_profile";
  db.query(sqlSelect,(err, result)=>{
     res.send(result);
  });
});

//get request
app.get("/get/employee", verifyJWT, (req, res) => {
  const id = req.userId;
  const sqlSelect = "SELECT * FROM staff_profile WHERE StaffID = ?";
  db.query(sqlSelect,id,(err, result)=>{
     res.send(result);
  });
});

//update employee info
app.put("/employee/update/", (req, res)=>{
  const {StaffID, DateOfBirth,MobileNumber, PersonalEmail,HomeAddress,
    MaritalStatus,EmergencyContact_Name, EmergencyContact_MobileNumber,
    Relationship,EmergencyContact_HomeAddress} = req.body;
  

    const sqlUpdate= "UPDATE staff_profile SET DateOfBirth = ?, MobileNumber = ?, PersonalEmail= ?, HomeAddress= ?, MaritalStatus= ?, EmergencyContact_Name= ?,  EmergencyContact_MobileNumber= ?, Relationship= ?,EmergencyContact_HomeAddress= ? WHERE StaffID = ?"
    db.query(sqlUpdate, [DateOfBirth, MobileNumber, PersonalEmail, HomeAddress, MaritalStatus, EmergencyContact_Name, EmergencyContact_MobileNumber, Relationship,EmergencyContact_HomeAddress, StaffID], (err, result)=>{
      if(result){
        return res.status(200).json({
          message: "User Profile Updated"
        })
      }
      else{
        return res.status(400).json({
          message: "An error occured"
        })
      }
        console.log(result);
    });
});

/************************Image Upload****************************** */
const StaffID = 10001;
app.post("/imageupload/", (req, res)=>{
  const {image} = req.body;

    const sqlUpdate= "UPDATE staff_profile SET Passport=? WHERE StaffID = ?"
    db.query(sqlUpdate, [image, StaffID ], (err, result)=>{
      if(result){
        return res.status(200).json({
          message: "Image Uploaded"
        })
      }
      else{
        return res.status(400).json({
          message: "An error occured"
        })
      }
        console.log(result);
    });
});


/* ..............staff_qualification post request.............. */
app.post("/add", (req, res) => {

  const {NameOfInstitution,CourseOfStudy,Year,Certification} = req.body;
  
  const sqlInsert = "INSERT INTO staff_qualifications (NameOfInstitution,CourseOfStudy,Year,Certification) VALUES (?,?,?,?)";
  db.query(sqlInsert, [NameOfInstitution,CourseOfStudy,Year,Certification], (err, result) => {
      console.log(err);
  });
});

/* ..............staff_certification post request.............. */
app.post("/post", (req, res) => {

  const {Certification,DateOfIssue,ExpiryDate} = req.body;
  
  const sqlInsert = "INSERT INTO staff_certifications (Certification,DateOfIssue,ExpiryDate) VALUES (?,?,?)";
  db.query(sqlInsert, [Certification,DateOfIssue,ExpiryDate], (err, result) => {
      console.log(err);
  });
});

/* ..............first question get request.............. */
app.post("/get/questions/:sn", (req, res)=>{
  //const sn = 1;
  const sn = req.params.sn;
  const sqlSelect ="SELECT * FROM appraisalsectiona ";
  db.query(sqlSelect, (err, result)=>{
    res.send(result);
 });
 });
/* ..............appraisalquestions(Next) get request.............. */
app.post("/get/nextquestions/:sn", (req, res)=>{
 const sn = req.body.sn;
 console.log(sn);
 const sqlSelect ="SELECT * FROM appraisalsectiona WHERE SN > ? ORDER BY SN LIMIT 1 ";
 db.query(sqlSelect, sn, (err, result)=>{
   res.send(result);
});
});

/* ..............appraisalquestions(Previous) get request .............*/
app.post("/get/prevquestions/:sn", (req, res)=>{
  const sn = req.params.sn;
   const sqlSelect ="SELECT * FROM appraisalsectiona WHERE SN < ?  ORDER BY SN DESC LIMIT 1";
   db.query(sqlSelect, sn, (err, result)=>{
     res.send(result);
  });
});

/* ..............appraisalanswers post request.............. */
app.post("/KPI", (req, res) => {
  const staffEmail = req.body.staffEmail;
  const quarter = "Third Quarters";
  const section = "A"
  const snumber = req.body.sn;
  const ints = "test";
  const staff = req.body.answer;
  
  const sqlInsert = "INSERT INTO KPI (staffEmail,quarter,section,snumber,ints,staff) VALUES (?,?,?,?,?,?)";
  db.query(sqlInsert, [staffEmail,quarter,section,snumber,ints,staff], (err, result) => {
      console.log(err);
  });
});

/* ..............user create password.............. */
app.put("/createpassword", (req, res) => {
  const Password = req.body.Password;
  const email = req.body.email;
  bcrypt.hash(Password, round, (err, hash)=>{
  const sqlInsert = "UPDATE staff_profile SET Password = ?  WHERE OfficialEmail = ?";
    db.query(sqlInsert, [hash, email], (err, result) => {
       
      console.log(result.data)
      if (result){
        const id = email;
        const token = jwt.sign({id}, "secret",{
        expiresIn: 6000,
        })
        res.json({auth: true, token: token, result: result })
      }
      else{ res.json({auth: false, message: "" })}
      

    });
  })
});

/* ..............user check.............. */
app.post("/checkUser", (req, res) => {
  const email = req.body.email;
 
  const sqlSelect = "SELECT * FROM staff_profile WHERE officialEmail = (?)";
  db.query(sqlSelect, email, (err, result) => {
    if(err){
        console.log(err)
      } 
    if(result.length > 0) {res.send(result)} 
    else{res.send("Username don't exist")}
  });
});

/* .............. login.............. */
app.post("/api/login", (req, res) => {
  const username = req.body.email;
  const password = req.body.password;

      const sqlSelect = "SELECT * FROM staff_profile WHERE officialEmail = ?;";
      db.query(sqlSelect, username, (err, result) => {
      if(err){
            res.send({err: err})
          } 
      if(result.length > 0) {
          bcrypt.compare(password, result[0].Password, (error, response) =>{
              if(response){
                  const id = result[0].OfficialEmail;
                  const token = jwt.sign({id}, "secret",{
                    expiresIn: 600,
                  })
                  res.json({auth: true, token: token, result: result })
              }
              else{res.json({auth: false, message: "incorrect password" })}
              })
          } 
      
      });
});  



/* app.post("/checkUser", (req, res) => {
  const password = req.body.password;
 
  const sqlSelect = "SELECT * FROM staff_profile WHERE Password = (?)";
  db.query(sqlSelect, password, (err, result) => {
    if(err)
    {
        console.log(err)
    } 
    if(result.length > 0) 
     {
       res.send(result);
     } 
    else{res.send("Wrong password")}
  });
});
 */

//Listening to Server
app.listen(3001, ()=>{
    console.log("running on port 3001");
}); 