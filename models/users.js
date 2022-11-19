const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

// define the schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  admin: Boolean,
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, admin: this.admin, name: this.name },
    config.get("jwtKey")
  );
  return token;
};

// create User model
const user = mongoose.model("user", userSchema);

module.exports = user;
