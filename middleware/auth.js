const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const config = require("config");
const sessionstorage = require("sessionstorage");

// session express

// Session

const session = require("express-session");
const sessionOptions = {
  
  resave: false,
  saveUninitialized: false,
};
app.use(
  session({
    secret: "notGoodSecret",
    sessionOptions,
  })
);

module.exports = (req, res, next) => {
  // const token = req.header('x-auth-token');

  let tempToken = sessionstorage.getItem("x-auth-token");
  const { token } = req.session;
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtKey"));
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};
