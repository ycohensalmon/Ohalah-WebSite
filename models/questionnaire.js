const mongoose = require("mongoose");

const questionsSchame = mongoose.Schema({
  color: String,
  skill: String,
  bruto: Number,
  neto: Number,
  questions: Array,
});

const Question = mongoose.model("question", questionsSchame);

module.exports = Question;
