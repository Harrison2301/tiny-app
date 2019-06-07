var randomstring = require("randomstring");
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');
app.use(cookieParser())

app.set("view engine", "ejs");

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
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

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

  app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase,username: req.cookies["username"]};
    res.render("urls_index", templateVars);
  });

  app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],username: req.cookies["username"]};
    //console.log(urlDatabase[req.params.shortURL])
  
    res.render("urls_show", templateVars);
  });
  app.post("/urls", (req, res) => {
   let short = randomstring.generate(6);
   urlDatabase[short] = req.body.longURL

    console.log(req.body);  // Log the POST request body to the console
    res.redirect("/urls") // Respond with 'Ok' (we will replace this)
  });

  app.get("/u/:shortURL", (req, res) => {
    const longerURL = urlDatabase[req.params.shortURL]
    res.redirect(longerURL);
  });
  
  
  app.post("/urls/:shortURL/delete", (req, res) => {
   delete urlDatabase[req.params.shortURL]
    res.redirect("/urls")
  });
  
  app.post("/urls/:shortURL", (req, res) => {
    urlDatabase[req.params.shortURL] = req.body.longURL 
   res.redirect("/urls")
 });
  
  app.post("/login", (req, res) => {
    res.cookie("username", req.body.username);
    res.redirect("/urls");
  });
  

  app.post("/logout", (req, res) => {
    res.clearCookie("username")
    res.redirect("/urls")
  });

  app.get ("/register", (req, res) => {
    res.render("register.ejs", {username: ''})
  })
 
  const findingExistingUser = (email) => {
    for(userId in users){
      if(users[userId].email === email){
        return users[userId]
      }
    }
  }

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
    res.cookie("username", lEmail)
    res.redirect("/urls")
  }})