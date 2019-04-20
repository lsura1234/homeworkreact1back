const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var nodemailer = require('nodemailer');

var cors = require('cors')

const connect = `mongodb://localhost:27017/bank?authSource=admin`;
mongoose.connect(connect, { useNewUrlParser: true });
app.use(cors())
var db = mongoose.connection;

db.on("connected", function() {
  console.log("connected");
});
//config gmail
var transport = {
  host: 'smtp.gmail.com',
  auth: {
    user: 'alleereact@gmail.com',
    pass: 'allee1011'
  }
}
var transporter = nodemailer.createTransport(transport)
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log('Server is ready to take messages');
  }
});



const Schema = mongoose.Schema;

const personal = new mongoose.Schema({
  id: String,
  First_Name: String,
  Middle_Name: String,
  Last_Name: String,
  account_id:String,
  Home_Phone: String,
  Mobile_Phone: String,
  Email_Address: String,
  Mailing_Address: String,
  Social_Security_Number:String,
  Employers_Name:String,
  Employers_Address:String,
  Work_Phone:String,
  Job_Position:String,
  
});
const account = new mongoose.Schema({
  id: String,
  Account_Type: String,
  Purpose : String,
  Money_Come: String,
  Money:Number,
  About_Us:String,
  balance: Number
});
let personals = mongoose.model("personal", personal);
let accounts = mongoose.model("account", account);

////////////////////////////// ถึงส่วนนี้ //////////////////////////////////////////
app.get("/", async (req, res) => {
  const stu = await personals.find({});
  console.log(stu);
  res.send(stu);
});


const middleware = (req, res, next) => {
  /* ตรวจสอบว่า authorization คือ Boy หรือไม่*/
     if(req.headers.authorization === "Boy")
        next(); //อนุญาตให้ไปฟังก์ชันถัดไป
     else
        res.send("ไม่อนุญาต");
  }; 

app.use(bodyParser.json());
app.post("/personal/register",async (req, res) => {

  personals.find({ Email_Address:req.body.email},(err , data) =>{
    console.log(data.length)
      if(data.length!==0) res.send(req.body)
      else {
         const a_id=Math.ceil(Math.random()*(9999999999-1000000000)+1000000000);
        personals.create({
          First_Name: req.body.firstName,
          Middle_Name: req.body.middleName,
          Last_Name: req.body.lastName,
          Home_Phone: req.body.home,
          Mobile_Phone: req.body.mobile,
          Email_Address: req.body.email,
          Mailing_Address: req.body.address,
          Social_Security_Number:"0000",
          Employers_Name:req.body.name,
          Employers_Address:req.body.adress,
          Work_Phone:req.body.phone,
          Job_Position:req.body.job,
          account_id:a_id,
        });
        accounts.create({
          id:a_id,
          Account_Type: req.body.type,
          Purpose : req.body.purpose,
          Money_Come: req.body.come,
          Money:req.body.money,
          About_Us:req.body.about,
          balance: req.body.balance,
        });
        res.json({"a_id":a_id})
      } 
  })
    
    
});


app.post("/login", async (req, res) => {
  var email
  var message
  var OTP = Math.ceil(Math.random()*(9999-1000)+1000);
  var name = "alleereact@gmail.com"

  personals.find({ Email_Address:req.body.username},(err , data) =>{
    if(err) console.log(err)
        personals.findByIdAndUpdate(data[0]._id,{Social_Security_Number:OTP},(err2,data2) => {

      });
  });
       email = req.body.username
        var mail = {
        from: name,
        to: email,
        subject: "OTP to connect bank",
        text: "OTP : "+OTP
      }
      transporter.sendMail(mail, (err, data) => {
        if (err) {
          res.json({
            msg: 'fail'
          })
        } else {
          res.json({
            msg: 'success'
          })
        }
      })
 });
app.post("/login/otp", async (req, res) => {
  personals.find({ Email_Address:req.body.email},(err , data) =>{
    if(err) console.log(err);
    if(data[0].Social_Security_Number===req.body.otp){
      res.json(data);
    }
    else{
      res.send("no")
    }

  });
});
app.post("/cheackTranfer", async (req, res) => {
  console.log(req.body.myID)
  personals.find({ account_id:req.body.sendID},(err , data) =>{
        if(data.length!==0 ){
            accounts.aggregate([
              {
                $group: { 
                  _id: req.body.myID, 
                   totalMoney: {
                     $sum: {
                       $cond: [
                           {$eq: ["$id", req.body.myID] },"$Money",0
                        ] 
                      }
                     }
                }
              }
          ],(err,data2) =>{
            if(data2[0].totalMoney<req.body.money){
              res.json({
                data:"you have money "+data2[0].totalMoney,
                status:"fail"
              })
            }
           else 
            res.json({
              data:"send money "+req.body.money+" to "+data[0].First_Name+" "+ data[0].Middle_Name+" "+data[0].Last_Name,
              status:"succes"
            })
          })
        }
        else{
          res.json({
            data:"ID not found",
             status:"fail"
        })
         }
         
    })
})
app.post("/tranfer", async (req, res) => {
  
  await accounts.create({
    id:req.body.sendID,
    Money_Come:"tranfer from "+req.body.myID,
    Money:req.body.money
  });
  await accounts.create({
    id:req.body.myID,
    Money_Come:"tranfer to "+req.body.myID,
    Money:`-${req.body.money}`
  });
  res.send("sccuess")
})
app.post("/home", async (req, res) => {
  personals.find({ account_id:req.body.id},(err , data) =>{
    if(data.length!==0){
        accounts.aggregate([
          {
            $group: { 
              _id: req.body.id, 
              totalMoney: {
                $sum: {
                  $cond: [
                      {$eq: ["$id", req.body.id] },"$Money",0
                    ] 
                  }
                }
            }
          }
        ],(err,data2) =>{
          console.log(data2[0].totalMoney)
          res.json(data2[0].totalMoney)
        })
    }
  })
})
const loginMiddleware = (req, res, next) => {
    if(req.body.username === "al" && 
       req.body.password === "1234") next();
    else res.send("Wrong username and password") 
    //ถ้า username password ไม่ตรงให้ส่งว่า Wrong username and password
 }




app.listen(3000);

