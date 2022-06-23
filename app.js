require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 5;
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
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    if (!err) {
      const newUser = new User({
        email: req.body.username,
        password: hash,
      });

      //   save() method to add user to the database
      newUser.save(function (err) {
        if (err) {
          console.log(err);
        } else {
          res.render("secrets");
        }
      });
    }
  });
});

app.post("/login", function (req, res) {
  const username = req.body.username;

  User.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(
          req.body.password,
          foundUser.password,
          function (err, result) {
            if (result === true) {
              res.render("secrets");
            }
          }
        );
      } else {
        res.send("<h1>user not found</h1>");
      }
    }
  });
});
app.listen(3000, function () {
  console.log("server is started on 3000 ");
});
