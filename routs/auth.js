const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const User = require("../models/users");
const router = express.Router();
const sessionstorage = require("sessionstorage");

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

router.post("/", async (req, res) => {
  let user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  //   res.json({ token: user.generateAuthToken() });

  let token = user.generateAuthToken();
  // change to seesion express
  // sessionstorage.setItem("x-auth-token", JSON.stringify(token));
  req.session.token = token;
  var hour = 3600000;
  req.session.cookie.expires = new Date(Date.now() + hour);
  req.session.cookie.maxAge = hour;
  user.admin
    ? res.redirect("http://localhost:3000/admin")
    : res.redirect("http://localhost:3000/stud");
});
router.get("/logOut", (req, res) => {
  var hour = -3600000;
  /*
  */
   req.session.cookie.expires = new Date(Date.now() + hour);
   req.session.cookie.maxAge = hour;
   res.redirect("http://localhost:3000")
  });

module.exports = router;
