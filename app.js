const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { appendFileSync } = require("fs");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mongoose.connect(
  "mongodb://localhost:27017/userDB",
  function () {
    console.log("connected with database ");
  }
);

// user's Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// user model
const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });

  //   save() method to add user to the database
  newUser.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (password === foundUser.password) {
          res.render("secrets");
        } else {
          res.send("<h1>Incorrect password</h1>");
        }
      } else {
        res.send("<h1>user not found</h1>");
      }
    }
  });
});
app.listen(3000, function () {
  console.log("server is started on 3000 ");
});
