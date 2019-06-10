var randomstring = require("randomstring");
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');
app.use(cookieParser());
// var cookieSession = require("cookie-session");
// app.use(cookieSession());
// var bcrypt = require("bcrypt");
 

app.set("view engine", "ejs");

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "harrison.winters@hotmail.com", 
    password: "harrison"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const findingExistingUser = (email) => {
  for(userId in users){
    if(users[userId].email === email){
      return users[userId]
    }
  }
  return false
}


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// ************* GET *************
app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  let templateVars = {
    user: user
  }
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

  app.get("/urls", (req, res) => {
    let userid= req.cookies["user_id"]
    console.log(userid)
    console.log(users[userid])
    let templateVars = { urls: urlDatabase,user: users[userid]}
    res.render("urls_index", templateVars);
  });

  app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],users: [req.cookies.user_id]};
    //console.log(urlDatabase[req.params.shortURL])
  
    res.render("urls_show", templateVars);
  });

  app.get("/u/:shortURL", (req, res) => {
    const longerURL = urlDatabase[req.params.shortURL]
    res.redirect(longerURL);
  });

  app.get ("/register", (req, res) => {
    res.render("register.ejs", {user: users[req.cookies.user_id]})
  })

  app.get("/login", (req, res) => {
    
    res.render("login")
  });
  // ************* POST *************

  app.post("/login", (req, res) => {
    let email = req.body.email 
    let password = req.body.password
    let user = findingExistingUser(email)
    if (user && user.password === password){
      res.cookie("user_id",user.id)
      res.redirect("/urls");
    } else { res.send ("<html><body>Wrong <b>Email/Password</b></body></html>\n")
      
    }
    
  });

  app.post("/urls", (req, res) => {
   let short = randomstring.generate(6);
   urlDatabase[short] = req.body.longURL

    console.log(req.body);  
    res.redirect("/urls") 
  });

  app.post("/urls/:shortURL/delete", (req, res) => {
   delete urlDatabase[req.params.shortURL]
    res.redirect("/urls")
  });
  
  app.post("/urls/:shortURL", (req, res) => {
    urlDatabase[req.params.shortURL] = req.body.longURL 
   res.redirect("/urls")
 });
  
    app.post("/logout", (req, res) => {
    res.clearCookie("user_id")
    res.redirect("/urls")
  });

 
app.post ("/register", (req, res) => {
   var newObj = {};
   const lEmail = req.body.email
  let iD = randomstring.generate(6)
   let foundUser = findingExistingUser(lEmail)
   console.log(foundUser)
  if (lEmail === ""){
    res.status(400)
    res.end('No good')
  } else if(foundUser){
    res.status(400)
    res.end('No good')
  } else {
    newObj.id = iD
    newObj.email = lEmail
    newObj.password = req.body.password
    users[iD] = newObj
    res.cookie("user_id", iD)
    res.redirect("/urls")
  }})

  