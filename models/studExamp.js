const mongoose = require("mongoose");

const studSchame = new mongoose.Schema({
  //Write you schema here
  name: String,
  teacherId: String,
  nextStageRequest: Boolean,
  info: Object,
  // After problems with Objects, ,move to array
  // questions:Object
  skills: Array,
  history: Array,
});

const student = mongoose.model("student", studSchame);

module.exports = student;
