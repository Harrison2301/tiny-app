var randomstring = require("randomstring");
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var bcrypt = require("bcrypt");
app.set("view engine", "ejs");



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//Cookie Parser
var cookieParser = require('cookie-parser');
app.use(cookieParser());


//Body Parser
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

//Cookie Session
var cookieSession = require("cookie-session");
app.use(cookieSession({
  name: 'session',
  keys: ['secretKey'],
  maxAge: 24 * 60 * 60 * 1000 
}));


//****DataBases */
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "harrison.winters@hotmail.com", 
    password: "$2a$10$xj3wxFwHB7dszxrYxeefgeXcgNRJ1M1vgoB/mwm/nVHEidnmzJdhS"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "$2a$10$Xc9Cw5AjcQKVtK6h.JktauXuez5a3l1.8619iSxkLarjtshlIO/1i"
  }
};

var urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};



app.use(function(req, res, next) {
  res.locals.user_id = req.session.user_id || false;
  next();
});


// indicates given user to users in DB
const findingExistingUser = (email) => {
  for (var userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  } 
  return false;

};

// indicates if shortURL is under correct user 
function userURL (userId, shortURL) {
  for (var id in urlDatabase) {
    if ((urlDatabase[id].userID === userId && urlDatabase[id].shortURL === shortURL)) {
      return true;
    } 
  }
  return false;

}


//indicates correct user 
function correctUser(email, password){
  var cUser= false;
  var userID;
  for(var key in users){
    if((users[key].email === email) 
    && (bcrypt.compareSync(password, users[key].password))){

      cUser= true;
      userID = key;
      break;
    }
  } return userID;
}


// Login get and post

app.get("/login", (req, res) => {
  var userID = req.session.user_id;
  let templateVars = { user: users[req.session.user_id], urls: urlDatabase};
    res.render("login", templateVars);
 });
 


 app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = correctUser(email, password);
  if (user){
    req.session.user_id = user;
    res.redirect("/urls");
  } else { 
    res.status(403).send("Incorrect username and/or password!");
  }  
});

//Logout

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


// Register get and post

app.get("/register", (req, res) => {
  let userId = req.session.user_id;
  const user = users[userId];
  let templateVars = {
    user: user
  }
  if(userId) {
    res.redirect('/urls');
  } else {
  res.render("register", templateVars);
  }
});

 app.post("/register", (req, res) => {
  var userID = randomstring.generate(6)
  var password = req.body.password;
  var encriptPass = bcrypt.hashSync(password, 10);
  let newUser = {
    id: userID,
    email: req.body.email,
    password: encriptPass
  };
  if (!newUser.email || !newUser.password) {
    res.status(400).send("Please enter username and password!");
  } else if (findingExistingUser(req.body.email)) {
    res.status(400).send("Already account with this User");
  } else {
    users[userID] = newUser;
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});


app.get("/", (req, res) => {
  let userId = req.session.user_id;
  if (userId){
  res.redirect("/urls");
  } else {
    res.redirect("/login")
  }
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  let templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

 
  app.get("/urls", (req, res) => {
    let userId = req.session.user_id;
    let user = users[userId];
    if(userId) {
      let templateVars = {
        urls: urlDatabase,
        user: user
      };
      res.render("urls_index", templateVars);

    } else {
      res.status(400).send("Please login!");
    }
  });


  app.get("/u/:id", (req, res) => {
    if (!urlDatabase[req.params.id]){
      res.status(400).send("No good");
  
    } else {
      res.redirect(urlDatabase[req.params.id].longURL);
    }
    });

  app.get("/urls/:id", (req, res) => {
    var shortUrl = req.params.id;
    var userID = req.session.user_id;
    var user = users[userID];

    if(userURL(userID, shortUrl)) {
      let templateVars = {
        shortURL: req.params.shortURL,
        longURL: req.params.longURL,
        urlObj: urlDatabase[req.params.id],
        user: user
      };
      
      res.render("urls_show", templateVars,);
    }
    else {
      res.status(400).send("Can not edit this URL");
    }
  });

//**URLS */**POST */
  app.post("/urls/:id", (req, res) => {
  let userID = req.session.user_id;
  if(userID){
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls/:id");
  } else {
    res.status(400).send("You do not have permission");
  }
  });

  app.post("/urls/:id/delete", (req, res) => {
    var ObjURL = urlDatabase[req.params.id];
    if(ObjURL.userID === req.session.user_id){
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
    } else {
      res.status(403).send("You do not have permission");
    }
  });

  app.post("/urls", (req, res) => {
    let short = randomstring.generate(6);
    urlDatabase[short] = {
      shortURL: short,
      longURL: req.body.longURL,
      userID: req.session.user_id,
    }
     res.redirect("/urls") 
   });

 
  