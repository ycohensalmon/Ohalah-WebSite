const express = require("express");
const app = express();
const Router = require("express").Router();

// importing uuid for ids
const { v4: uuidv4 } = require("uuid");
// connetct ejs
const { join } = require("path");
app.set("views", join(__dirname, "views"));
app.set("view engien", "ejs");

const mongoose = require("mongoose");
const Question = require("../models/questionnaire");
const auth = require("../middleware/auth");


Router.get("/RequestAddNew", auth, async  (req, res) => {
  let data = await Question.find({});
  let admin = req.user.admin;
  let update = true;
  //console.log(data);

  res.render("questionnaires/questionnairesView.ejs", { data, admin, update });
});

Router.post("/addNew", auth, async (req, res) => {
  const { skill, color } = req.body;
  
  if(skill != null  &&  color != null)
  {
    let admin = req.user.admin
    
    let data = await Question.findOne({ color: color, skill: skill }).exec();
    
    //if the questionnarie alredy exist
    if (data != null) {
      res.render("questionnaires/updateRequest.ejs", { data, admin });
      return;
    }
    
    //create a new questionnaire
    let id = uuidv4();
    data = new Question({
      color: color,
      skill: skill,
      bruto: 0,
      neto: 0,
      questions: [],
    });
    
    //saving the new questionnaire to mongo
    let result = await data.save();
    res.render("questionnaires/updateRequest.ejs", { data, admin });
  }

  else
    res.redirect("/RequestAddNew");
});

Router.post("/update", auth, async (req, res) => {
  const { color, skill, id, text, active, lastActive } = req.body;
  //try to catch th questionnaire by question id.
  //let exchangeData = await Question.findOne({_id: id}).exec();
  //console.log(exchangeData);
  let admin = req.user.admin;
  let data = await Question.findOne({ color: color, skill: skill }).exec();

  //changing the requested question
  for (ques of data.questions) {
    if (ques.id == id) {
      //if there was a change in active
      if (active != lastActive) {
        if (active == "true") {
          data.neto = data.neto + 1;
          ques.active = true;
        } else {
          data.neto = data.neto - 1;
          ques.active = false;
        }
      }
      //if there was a change in the question text
      if (text != "") ques.text = text;
    }
  }
  console.log(data.neto);
  //update mongo
  let updateQestion = await Question.findOneAndUpdate(
    { color: color, skill: skill },
    { questions: data.questions, neto: data.neto },
    { new: true }
  );

  res.render("questionnaires/updateRequest.ejs", { data, admin });
});

Router.post("/addQuestion", auth, async (req, res) => {
  const { color, skill, text } = req.body;

  let data = await Question.findOne({ color: color, skill: skill }).exec();
  let admin = req.user.admin;
  //console.log(data);

  let newQuestion = { id: uuidv4(), text, active: true };
  data.questions.push(newQuestion);
  data.bruto += 1;
  data.neto += 1;

  //update mongo
  let update = await Question.findOneAndUpdate(
    { color: color, skill: skill },
    { questions: data.questions, bruto: data.bruto, neto: data.neto }
  );

  res.render("questionnaires/updateRequest.ejs", { data, admin });
});

module.exports = Router;
