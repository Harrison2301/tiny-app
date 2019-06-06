var randomstring = require("randomstring");
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');
app.use(cookieParser())

app.set("view engine", "ejs");

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
   let randomstring = require("randomstring");
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