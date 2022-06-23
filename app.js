require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { appendFileSync } = require("fs");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// telling our app to use session
app.use(
  session({
    secret: "Out littel Secret.",
    resave: false,
    saveUninitialized: false,
  })
);

// telling our app to use passport and intitialze it
app.use(passport.initialize());
// telling passport to use session
app.use(passport.session());
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

// this will be used to hash and salt the password and also store it into the mongodb
userSchema.plugin(passportLocalMongoose);
// user model
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) console.log(err);
  });
  res.redirect("/");
});
app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.render("login");
  }
});

app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});
app.listen(3000, function () {
  console.log("server is started on 3000 ");
});
