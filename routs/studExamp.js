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

const Student = require("../models/studExamp");
const Question = require("../models/questionnaire");
const auth = require("../middleware/auth");

const { json } = require("body-parser");
const student = require("../models/studExamp");
const user = require("../models/users");

Router.get("/goToq/:id", async (req, res) => {
  let id = req.params.id;
  let student = await Student.findOne({ _id: id }).exec();
  
  let lifeSkills = await Question.findOne({
    color: student.skills[0].color,
    skill: "lifeSkills",
  }).exec();
  
  let emotionSkills = await Question.findOne({
    color: student.skills[1].color,
    skill: "emotionSkills",
  }).exec();
  
  let learningSkills = await Question.findOne({
    color: student.skills[2].color,
    skill: "learningSkills",
  }).exec();
  

  let data = {
    student,
    skills: [lifeSkills, emotionSkills, learningSkills],
  };
  //student.skills[0].questions.push(lifeSkills.questions[0].id);
  

  res.render("stud/studView.ejs", { data });
});

Router.post("/studentUpdate/:id/updateResult", async (req, res) => {  
  const obj = req.body;
  let student = await Student.findOne({ _id: obj.sId }).exec();  
  
  for (qId of obj.qId) {
    //if the student passed this question
    if (obj[qId] == "true") {
      //if the question dosn't exist in his results, insert it
      if (!student.skills[obj.skill].questions.includes(qId))
      student.skills[obj.skill].questions.push(qId);
    } 
    //if the student has not passed this question
    else {
      //if the question exist in his results, remove it
      if (student.skills[obj.skill].questions.includes(qId)) {
        let index = student.skills[obj.skill].questions.indexOf(qId);
        if (index > -1) student.skills[obj.skill].questions.splice(index, 1);
      }
    }
  }
  console.log(obj);
  console.log(student.skills[obj.skill].questions.length);
  let grade = (student.skills[obj.skill].questions.length / obj.qId.length);
  console.log(grade);
  if(grade >= 0.8)
  {
    let result = await Student.findOneAndUpdate(
      { _id: obj.sId },
      { skills: student.skills, nextStageRequest: true },
      { new: true }
    );
  }
  else{
    let result = await Student.findOneAndUpdate(
      { _id: obj.sId },
      { skills: student.skills },
      { new: true }
    );
  }

  res.redirect("/stud/studentUpdate/" + obj.sId);
});

Router.post("/studentUpdate/:id/historyView", async (req, res) => {
  let id = req.params.id;
  console.log(id);
  let student = await Student.findOne({ _id: id }).exec();
  let questionnaire = await Question.find();

  let data = {
    student,
    questionnaire,
    admin: false,
  };

  let admin = false;
  
  res.render("stud/historyView.ejs", { data, admin });
});

Router.get("/addQ", auth, async (req, res) => {
  console.log(req.user._id);
  console.log(req.user.name);
  console.log(req.user.admin);
  res.send(req.user);
});

Router.get("/addStudent", (req, res) => {  
  res.render("stud/addStud.ejs");
});

Router.post("/addStuds", async (req, res) => {
  const { name, id, phone, teacher } = req.body;

  const student = new Student({
    name: name,
    teacherId: teacher,
    nextStageRequest: false,
    info: {
      id: id,
      phone: phone,      
    },
    skills: [
      {
        skill: "lifeSkills",
        color: "red",
        questions: [],
      },
      {
        skill: "emotionSkills",
        color: "red",
        questions: [],
      },
      {
        skill: "learningSkills",
        color: "red",
        questions: [],
      },
    ],
    history: [[], [], []],
  });
  let result = await student.save();
  console.log(result);
  res.redirect("/stud");
});

Router.post("/teacherStudentsView", async (req, res) => {
  const { teacher } = req.body;
  let students = await Student.find({ "info.teacher": teacher });
  let data = {
    teacher: "המורה  " + teacher,
    students,
  };
  console.log(data);
  res.render("stud/stud.ejs", { data });
});

Router.get("/studentUpdate/:id", auth, async (req, res) => {
  let id = req.params.id;

  let student = await Student.findOne({ _id: id });

  let lifeSkills = await Question.findOne({
    color: student.skills[0].color,
    skill: "כישורי חיים",
  }).exec();
  
  let emotionSkills = await Question.findOne({
    color: student.skills[1].color,
    skill: "כישורי רגש",
  }).exec();
  
  let learningSkills = await Question.findOne({
    color: student.skills[2].color,
    skill: "כישורי למידה",
  }).exec();

  let data = {
    student,
    skills: [lifeSkills, emotionSkills, learningSkills],
    admin:false
  };

  res.render("stud/studUpdateRequest.ejs", { data });
});

Router.post("/studentUpdate/:id", async (req, res) => {
  let id = req.params.id;
  const { phone, teacher } = req.body;
  let student = await Student.findOne({ _id: id });

  res.redirect("/");
});

Router.get("/questionnairesView", auth, async (req, res) => {
  let data = await Question.find({});
  let admin = req.user.admin;
  let update = false;
  console.log(data);

  res.render("questionnaires/questionnairesView.ejs", { data, admin, update });
});

Router.get("/", auth, async (req, res) => {
  let { name, _id, admin } = req.user;
  /*
  console.log(_id);
  console.log(name);
  console.log(admin);
  console.log("afsk");
  */
  // if (req.user.admin) {
  //   let students = await Student.find({});
  // }
  if (!_id) {
    res.send("</h1> הפרטים שלך אינם נכונים<h1>");
  }
  if (admin) {
    let students = await Student.find({});
  }

  let students = await Student.find({
    teacherId: _id,
  });

    let data = {
    teacher: req.user.name,
    students,
  };

  res.render("stud/stud1.ejs", { data });
});



module.exports = Router;
