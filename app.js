const express = require("express");
const app = express();
const port = 3000;
const { join } = require("path");
// inporting Routs
const question = require("./routs/question");
const stud = require("./routs/studExamp");
const auth = require("./routs/auth");
const users = require("./routs/users");
const admin = require("./routs/admin");

app.set("views", join(__dirname, "views"));
app.set("view engien", "ejs");
app.use(express.static(__dirname + '/public'));
const methodOverride = require("method-override");
const mongoose = require("mongoose");
// conneting to mongoose

// session
const session = require("express-session");
const sessionOptions = {
  resave: false,
  saveUninitialized: false,
};
app.use(
  session({
    secret: "notGoodSecret",
    secret: "notGoodSecret",
  })
);

async function main() {
  await mongoose
    .connect("mongodb://localhost:27017/ohalachProject")
    .then(() => {
      console.log("conected to Mongo");
    })
    .catch(() => {
      console.log("something in mongo whent wrong");
    });
}

main();

// this is to convert json
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// need to look again at method overide
app.use(methodOverride("X-HTTP-Method-Override"));

app.use("/question", question);
app.use("/auth", auth);
app.use("/stud", stud);
app.use("/users", users);
app.use("/admin", admin);

app.get("/", (req, res) => {
  res.render("menu.ejs");
});

app.get("*", (req, res) => {
  res.send("This page doesnot work");
});

app.listen(port, () => {
  console.log(`listing on port ${port}`);
});
