const express = require("express");
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require('bcrypt');
const round = 10;
const jwt = require('jsonwebtoken');
const fileUpload = require("express-fileupload");
const { response } = require("express");
const path = require('path');

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
app.use('/public', express.static(path.join(__dirname, 'uploads')));
app.use(fileUpload());


/* .............Employee Verification/Authentication.............. */
app.get("/user", verifyJWT ,(req, res)=>{
  const id = req.userId
     const sqlSelect = "SELECT * FROM staff_profile WHERE OfficialEmail = ?";
     db.query(sqlSelect, id, (err, result) => {
         res.send(result);
     });
  });

/*...............................................*/
app.get("/get", (req, res) => {
  const sqlSelect = "SELECT * FROM staff_profile";
  db.query(sqlSelect,(err, result)=>{
     res.send(result);
  });
});

/*................User Authentication.............*/
app.get("/get/employee", verifyJWT, (req, res) => {
  const id = req.userId;
  const sqlSelect = "SELECT * FROM staff_profile WHERE StaffID = ?";
  db.query(sqlSelect,id,(err, result)=>{
     res.send(result);
  });
});

/*............get Daily Nugget...............*/
app.get("/dailynugget", (req, res) => {
  const sqlSelect = "SELECT * FROM nugget";
  db.query(sqlSelect,(err, result)=>{
     res.send(result);
  });
});

/*............get questionA count...............*/
app.get("/getNumOfQuestA", (req, res) => {
  const sqlSelect = "SELECT COUNT (*) as count FROM appraisalsectiona";
  db.query(sqlSelect,(err, result)=>{
     res.send(result);
  });
});

/*............get questionA count...............*/
app.get("/getImage", (req, res) => {
  const id = req.headers["id"];
  const sqlSelect = "SELECT *  FROM staff_profile WHERE OfficialEmail = ?";
  db.query(sqlSelect, id,(err, result)=>{
     res.send(result);
  });
});

app.put("/img/upload", (req, res)=>{
    if(req.files){
      var file = req.files.img;
      var imgName = `http://localhost:3001/public/`+ file.name; //image name save to database
    }

    if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" ){                           
      file.mv('uploads/'+file.name, function(err) {    
        if (err)return res.status(500).send(err);
        else{
          const id = req.headers["id"];
               const upload  = "UPDATE  staff_profile SET Passport = ? WHERE OfficialEmail = ?"
               db.query(upload,[imgName, id], (err, result)=>{
                if(result){
                  return res.status(200).json({
                    message: "Passport Uploaded"
                  })
                }
                else{
                  return res.status(400).json({
                    message: "An error occured"
                  })
                }
               } )             
            }
    }) 
  }
});

/* ..............Employee info update.............. */
app.put("/employee/update/", (req, res)=>{
  const {id, DateOfBirth,MobileNumber, PersonalEmail,HomeAddress,
    MaritalStatus,EmergencyContact_Name, EmergencyContact_MobileNumber,
    Relationship,EmergencyContact_HomeAddress} = req.body;
 
    const sqlUpdate= "UPDATE staff_profile SET DateOfBirth = ?, MobileNumber = ?, PersonalEmail= ?, HomeAddress= ?, MaritalStatus= ?, EmergencyContact_Name= ?,  EmergencyContact_MobileNumber= ?, RegistrationStatus = 'complete', Relationship= ?,EmergencyContact_HomeAddress= ? WHERE OfficialEmail = ?"
    db.query(sqlUpdate, [DateOfBirth, MobileNumber, PersonalEmail, HomeAddress, MaritalStatus, EmergencyContact_Name, EmergencyContact_MobileNumber, Relationship,EmergencyContact_HomeAddress, id], (err, result)=>{
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

/* ..............Image Upload.............. */
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
app.post("/questions/:sn", (req, res)=>{
  const sn = req.params.sn;
  const sqlSelect ="SELECT * FROM appraisalsectiona ";
  db.query(sqlSelect, (err, result)=>{
    res.send(result);
 });
 });

/* ..............appraisalquestions(Next) get request.............. */
app.post("/nextquestions/", (req, res)=>{
 const sn = req.body.sn;
 const sqlSelect ="SELECT * FROM appraisalsectiona WHERE SN > ? ORDER BY SN LIMIT 1 ";
 db.query(sqlSelect, sn, (err, result)=>{
   res.send(result);
});
const { user, quarter,section, questionN, value} = req.body;
const check = "SELECT * FROM kpi WHERE staffEmail = ? AND snumber = ?";
  db.query(check,[user, questionN] , (error, results)=>{
    if(results.length > 0){
    const myId = JSON.parse(JSON.stringify(results[0].id)) ;
    console.log(myId)
      const update = "UPDATE kpi SET value = ? WHERE  id = ?";
      db.query(update, [value, myId], (error, res)=>{
      });
    }else{
      const sqlInsert = "INSERT INTO kpi (staffEmail, quarter, section, snumber, value)  VALUES (?,?,?,?,?)";
      db.query(sqlInsert, [user, quarter,section, questionN, value], (err, result) => {     
    });
  }
  })

});

/* ..............appraisalquestions(Previous) get request .............*/
app.post("/prevquestions/", (req, res)=>{
  const sn = req.body.sn;
   const sqlSelect ="SELECT * FROM appraisalsectiona WHERE SN < ?  ORDER BY SN DESC LIMIT 1";
   db.query(sqlSelect, sn, (err, result)=>{
     res.send(result);
  });
});

/* ..............appraisalquestions(Next) get request.............. */
app.post("/nextquestionsB/", (req, res)=>{
  const sn = req.body.sn;
  const dept = req.body.dept;
  const sqlSelect ="SELECT * FROM appraisalsectionb WHERE sn > ? AND department = ? ORDER BY sn LIMIT 1 ";
  db.query(sqlSelect, [sn, dept], (err, result)=>{
    res.send(result);
 });
 const { user, quarter,section, questionN, value} = req.body;
 const check = "SELECT * FROM kpi WHERE staffEmail = ? AND snumber = ? AND section = 'B'";
   db.query(check,[user, questionN, quarter] , (error, results)=>{
     if(results.length > 0){
     const myId = JSON.parse(JSON.stringify(results[0].id)) ;
     console.log(myId)
       const update = "UPDATE kpi SET value = ? WHERE  id = ?";
       db.query(update, [value, myId], (error, res)=>{
 
       });
     }
     else{
       const sqlInsert = "INSERT INTO kpi (staffEmail, quarter, section, snumber, value)  VALUES (?,?,?,?,?)";
       db.query(sqlInsert, [user, quarter,section, questionN, value], (err, result) => {
   });
     }
   })
 
 });
 
 /* ..............appraisalquestions(Previous) get request .............*/
 app.post("/prevquestionsB/", (req, res)=>{
   const sn = req.body.sn;
    const sqlSelect ="SELECT * FROM appraisalsectionb WHERE sn < ?  ORDER BY sn DESC LIMIT 1";
    db.query(sqlSelect, sn, (err, result)=>{
      res.send(result);
   });   
 });

//get questionA count
app.get("/getNumOfQuestB", (req, res) => {
 const dept = req.headers.dept;
  const sqlSelect = "SELECT COUNT (*) as count FROM appraisalsectionb WHERE department = ?";
  db.query(sqlSelect, dept, (err, result)=>{
     res.send(result);
     console.log(err)
  });
});
/* ..............appraisalanswers post request.............. */
app.post("/submitAppraisal", (req, res) => {
  const staffEmail = req.body.user;  
  const sqlSelect = "SELECT SUM(value) AS ScoreSum FROM kpi WHERE staffEmail = ?";
  db.query(sqlSelect, staffEmail, (err, result) => {
      if (result){
        const Fscore = (result[0].ScoreSum);
        const insert = "INSERT INTO kpiscore (staffID, staff) VALUES(?,?)";
        db.query(insert, [staffEmail, Fscore], (error, response) =>{
          if(error){console.log(error)}
        } )
      }
      if(err){ 
        console.log(err)
      }
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

/* ..............appraisaloption get.............. */
app.get("/options", (req, res) => {
  const sqlSelect = "SELECT * FROM appraisaloptions";
  db.query(sqlSelect,  (err, result) => {
      res.send(result);
     // console.log(result)
      console.log(err)
  });
});

/* ..............appraisaloption post.............. */

app.post("/option", (req, res) => {
  const { user, quarter,section, questionN, value} = req.body;
  const check = "SELECT * FROM kpi WHERE staffEmail = ? AND snumber = ?";
  db.query(check,[user, questionN] , (error, result)=>{
    if(result.length > 0){
    const myId = JSON.parse(JSON.stringify(result[0].id)) ;
    console.log(myId)
      const update = "UPDATE kpi SET value = ? WHERE  id = ?";
      db.query(update, [value, myId], (error, res)=>{

      });
    }else{
      const sqlInsert = "INSERT INTO kpi (staffEmail, quarter, section, snumber, value)  VALUES (?,?,?,?,?)";
      db.query(sqlInsert, [user, quarter,section, questionN, value], (err, result) => {  
    });
    }
  })
});

app.get("/getScore", (req, res) => {
  user = req.headers["id"];
  const sqlSelect = "SELECT * FROM kpiscore WHERE staffID= ?";
  db.query(sqlSelect, user, (err, result) => {
      res.send(result);
     // console.log(result)
      console.log(err)
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

/* ..............check current user.............. */
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


/* ................. login................ */
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
                    expiresIn: 6000,
                  })
                  res.json({auth: true, token: token, id, result: result })
              }
              else{res.json({auth: false, message: "incorrect password" })}
              })
          } 
      });
}); 

/* .............. logout.............. */
app.get("/logout", (req, res) => {
  res.send("token", "", {maxAge: 1});
  res.redirect("/");
})


/* ..............Server Setup.............. */
app.listen(3001, ()=>{
    console.log("running on port 3001");
}); 