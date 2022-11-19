const express = require("express");
const app = express();
const Router = require("express").Router();
const bcrypt = require("bcrypt");
// importing uuid for ids
const { v4: uuidv4 } = require("uuid");
// connetct ejs
const { join } = require("path");
app.set("views", join(__dirname, "views"));
app.set("view engien", "ejs");

const mongoose = require("mongoose");

const Student = require("../models/studExamp");
const User = require("../models/users");
const Question = require("../models/questionnaire");
const auth = require("../middleware/auth");

const { json } = require("body-parser");
const { findById } = require("../models/questionnaire");
const { truncate } = require("lodash");
//const { NULL } = require("mysql/lib/protocol/constants/types");

//options for student data changes - came from teacherClass.ejs
Router.get("/studentUpdate/:id", auth, async (req, res) => {
  if (!req.user.admin) res.render("helpers/noAcess.ejs");
  let id = req.params.id;
  let admin = req.user.admin;
  let student = await Student.findOne({ _id: id });
  let teachers = await User.find();  
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
    admin:true
  };

  res.render("stud/studUpdateRequest.ejs", { data, teachers, admin });
});

Router.post("/studentUpdate/:id", auth, async (req, res) => {
  if (!req.user.admin) res.render("helpers/noAcess.ejs");
  
  let id = req.params.id;
  const{newTeacher} = req.body;
  
  if(newTeacher !=  null)
  {

    let teacher = await User.findOne({_id: newTeacher});
    
    let student = await Student.findOneAndUpdate(
      { _id: id }, {teacherId: newTeacher, 'info.teacher': teacher.name}, {new:true}
      );
  }

  res.redirect("/admin/studentUpdate/" + id);
});

Router.post("/studentUpdate/:id/historyView", auth, async (req, res) => {
  if (!req.user.admin) res.render("helpers/noAcess.ejs");
  let admin= req.user.body;
  let id = req.params.id;
  console.log(id);
  let student = await Student.findOne({ _id: id }).exec();
  let questionnaire = await Question.find();
  console.log(student.history[1]);
  let data = {
    student,
    questionnaire,
    admin: true,
  };
  
  res.render("stud/historyView.ejs", { data, admin });
});

Router.post("/studentUpdate/:id/turnOffNextStageRequest", auth, async (req, res) => {
  if (!req.user.admin) res.render("helpers/noAcess.ejs");
  console.log("hey baby");
  let id = req.params.id;
  console.log(id);
  let student = await Student.findOneAndUpdate({_id: id},{nextStageRequest: false});

  res.redirect("/admin/studentUpdate/" + id);
})

Router.post("/studentUpdate/:id/updateResult", auth, async (req, res) => {
  if (!req.user.admin) res.render("helpers/noAcess.ejs");
  
  const obj = req.body;
  console.log(obj);

  let student = await Student.findOne({ _id: obj.sId }).exec();

  //update results
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

  let result = await Student.findOneAndUpdate(
    { _id: obj.sId },
    { skills: student.skills },
    { new: true }
  );

  res.redirect("/admin/studentUpdate/" + obj.sId);
});

Router.post("/studentUpdate/:id/nextStage", auth, async (req, res) => {
  if (!req.user.admin) res.render("helpers/noAcess.ejs");

  const { skill, color, sId, passQuestions } = req.body;

  let colors = ["red", "orange", "yellow", "aqua", "lime"];
  let index = colors.indexOf(color);
  let student = await Student.findOne({ _id: sId }).exec();
  let passQ = passQuestions.split(",");
  console.log(passQ);
  //pushing this into the fitting skill..
  let colorHistory = { color, questions: passQ };
  
  //student history is an array of the skills, skill is a number
  student.history[skill].push(colorHistory);
  student.skills[skill].color = colors[index + 1];
  student.skills[skill].questions = [];

  let update = await Student.findOneAndUpdate(
    { _id: sId },
    { skills: student.skills, history: student.history }
  );
  
  res.redirect("/admin/studentUpdate/" + sId);
});

// this rout is to actuelly add a student
Router.post("/addStuds", auth, async (req, res) => {
  if (!req.user.admin) 
    res.render("helpers/noAcess.ejs");

  const { name, tz, phone, studTeacher } = req.body;

  if(studTeacher != null)
  {        
    const teachArray = studTeacher.split("-");
    
    const student = new Student({
      name: name,
      teacherId: teachArray[0],
      nextStageRequest: false,
      info: {
        tz: tz,
        phone: phone,
        teacher: teachArray[1],
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
    
    res.redirect("/admin/students");
  } 
  
  else
    res.redirect("/admin/studentsAddForm");
});

// This rout is to get the form add students
Router.get("/studentsAddForm", auth, async (req, res) => {
  if (!req.user.admin) res.render("helpers/noAcess.ejs");
  let teacher = await User.find();

  res.render("stud/addStud.ejs", { teacher });
});

// This rout is  students index
Router.get("/students", auth, async (req, res) => {
  if (!req.user.admin) res.render("helpers/noAcess.ejs");
  let students = await Student.find();
  res.render("admin/stud.ejs", { students });
});

// changing teacher info
Router.post("/userUpdate/:id", auth, async (req, res) => {
  // if someone came in with wrong token
  if (!req.user.admin) res.render("helpers/noAcess.ejs");
  let id = req.params.id;
  const { name, email, password } = req.body;
  let techer = await User.findById(id);
  let newName = name === "" ? techer.name : name;

  //update all his students
  if(newName  !=  "")
  {
    let studentsUpdate =  Student.updateMany({teacherId: id}, {'info.teacher': newName});
    console.log((await studentsUpdate).modifiedCount);
  }

  newEmail = email === "" ? techer.email : email;
  let newPassword;
  if (!password) {
    newPassword = teacher.password;
    console.log(newPassword + "in no password");
  } else {
    const salt = await bcrypt.genSalt(10);
    newPassword = await bcrypt.hash(password, salt);
    console.log(newPassword + "yes password");
  }

  const update = {
    name: newName,
    email: newEmail,
    password: newPassword,
  };

  let result = await User.findOneAndUpdate({ _id: id }, update);

  res.redirect("/admin");
});

// gets the info of a specific teacher

Router.get("/techerinfo/:id", auth, async (req, res) => {
  // if someone came in with wrong token
  if (!req.user.admin) res.render("helpers/noAcess.ejs");
  let tId = req.params.id;
  let teacher = await User.findById(tId);

  res.render("admin/teacherInfo.ejs", { teacher });
});

// Gets all of the students of the class - came frome teachers.ejs
Router.get("/techerClass/:id", auth, async (req, res) => {
  // if someone came in with wrong token
  if (!req.user.admin) res.render("helpers/noAcess.ejs");
  let tId = req.params.id;

  let teacher = await User.findById(tId);
  let students = await Student.find({ teacherId: tId });

  res.render("admin/teacherClass.ejs", { students, teacher });
});

// main rout of admin
Router.get("/", auth, async (req, res) => {
  if (!req.user.admin) res.render("helpers/noAcess.ejs");
  let teachers = await User.find({});

  res.render("admin/teachers.ejs", { teachers });
});


Router.post("/addStuds", auth, async (req, res) => {
  if (!req.user.admin) res.render("helpers/noAcess.ejs");
});

module.exports = Router;
