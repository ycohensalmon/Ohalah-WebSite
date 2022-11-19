const express = require("express");
const app = express();
const Router = require("express").Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { reduce } = require("lodash");

// importing uuid for ids
const { v4: uuidv4 } = require("uuid");
// connetct ejs
const { join } = require("path");
app.set("views", join(__dirname, "views"));
app.set("view engien", "ejs");

const mongoose = require("mongoose");
// importing Product;

const Question = require("./models/questionnaire");
const User = require("./models/users");
const Student = require("./models/studExamp");
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

const makeQ = async () => {
  let skills = ["כישורי חיים", "כישורי רגש", "כישורי למידה"];
  let colors = ["red", "orange", "yellow", "aqua", "lime"];
  let i = 0;
  for (skill of skills) {
    for (color of colors) {
      const questionnaire = new Question({
        color: color,
        skill: skill,
        bruto: 0,
        neto: 0,
        questions: [],
      });

      for(let j = 0; j < 7; j++)
      {
        let newQuestion = { id: uuidv4(), text: "question " + i.toString(), active: true };
        questionnaire.questions.push(newQuestion);
        questionnaire.bruto += 1;
        questionnaire.neto += 1;
        i++;
      }

      let result = await questionnaire.save();
      console.log(result);
    }
  }

  const salt = await bcrypt.genSalt(10);
  for(let i = 0; i < 10; i++)
  {
    const teacher = new User({
      name: "teacher " + i.toString(),
      email: i.toString() + "@gamil.com",
      password: "1234",
      admin: false,
    })
    
    teacher.password = await bcrypt.hash(teacher.password, salt);
    await teacher.save();
  }

  for(let i = 0; i < 50; i++)
  { 
    teacher = await User.findOne({name: "teacher " + (i % 10).toString()});
    const student = new Student({
      name: "student" + i.toString(),
      teacherId: teacher._id,
      nextStageRequest: false,
      info:{
        tz: ((i+1)*1000).toString(),
        phone:"050-1234567",
        teacher: teacher.name,
      },
      skills: [
        {
          skill: "כישורי חיים",
          color: "red",
          questions: [],
        },
        {
          skill: "כישורי רגש",
          color: "red",
          questions: [],
        },
        {
          skill: "כישורי למידה",
          color: "red",
          questions: [],
        },
      ],
      history: [[], [], []],
    })
    await student.save();
  }
};

makeQ();
