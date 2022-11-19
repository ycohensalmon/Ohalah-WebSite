# Ohalah WebSite
This website was built for the Ohalach association that deals with autistic children and promotes them in all areas, life skills, learning, emotions, etc.
The website contains a follow-up on the progress of the childrens' skills
The director of the association will be able to follow all the childrens' classes
And a teacher will be able to follow the childrens who are in his class

This site was built for the association's internal use so that not much effort was invested in the design of the site but in its functionality

## Summary
To run the site you need to do the following
1. install the VS or VS code 
2. install Node for run the code
3. install MongoDB for the database
4. after the instalation you need to download the code from this page to the VScode
5. in the VScode you need to run somme commands in the terminal
6. run the website on your browser ! 😊

## Downloads 
Downloads this programs un your pc

  - Install <a href="https://code.visualstudio.com/download" target="_blank">Visual Studio Code</a> workspace
  - Install <a href="https://nodejs.org/en/download/" target="_blank">Node</a> for run the code
  - Install <a href="https://www.mongodb.com/try/download/community" target="_blank">MongoDB</a> for the database
  
To cheak that the instalation is done its possible to cheak in the terminal the version of the program like this
```
node -v
npm -v
code -v
mongod -v
```
## Commands
### Commands from the terminal in the VS code
- Open the VS code
- Clone the project from this page or in case you have already downloaded the project then go to File -> Open Folder and add this project
- click on Terminal -> New Terminal
- It is better to choose a different terminal than the powershell, Click on the arrow next to Powershell -> Split Terminal and choise a different terminal like GitBash

you need to install some libraries to run the web site by commendes in the terminal
```
npm i express
```
```
npm i nodemone -g
```
```
npm i ejs
```

## The WebSite

after all instalations, we need to put the data to the database so in the terminal you need to run this command
```
node seeds.js
```

now we can run the WebSite
run this command on the terminal
```
nodemon app.js
```

cheak that in the terminal you see "listenning in port 3000" and  "connected to mongo"
and go to the browser and enter this link <a href="http://localhost:3000/" target="_blank">localhost:3000</a>

now you have the website 😊
