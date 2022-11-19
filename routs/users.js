const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const User = require("../models/users");
const auth = require("../middleware/auth");
const { reduce } = require("lodash");
const router = express.Router();

// this is for EJS
const { join } = require("path");
app.set("views", join(__dirname, "views"));
app.set("view engien", "ejs");

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/register", async (req, res) => {
  // check if the email already exist in the DB

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  user.email = user.email.toLowerCase();
  user.admin = false;
  console.log(user);
  await user.save();
  res.redirect("/admin");
});

router.get("/", async (req, res) => {
  res.render("registraion.ejs");
});

module.exports = router;
