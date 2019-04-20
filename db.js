const app = express();
const mongoose = require("mongoose");

const connect = `mongodb://localhost:27017/shoppers?authSource=admin`;
mongoose.connect(connect, { useNewUrlParser: true });
var db = mongoose.connection;

db.on("connected", function() {
  console.log("connected");
});

const Schema = mongoose.Schema;

const student = new mongoose.Schema({
  id: String,
  Name: String,
  Surname: String,
  thumbnail: String
});

let students = mongoose.model("student", student);
////////////////////////////// ถึงส่วนนี้ //////////////////////////////////////////
app.get("/", async (req, res) => {
  const stu = await students.find({});
  console.log(stu);
  res.send(stu);
});

app.get("/user", (req, res) => {
  students.create({
    id: "4",
    Name: "ssssss",
    Surname: "eeeee",
    thumbnail: "/index.js/.."
  });

  res.send("success");
});