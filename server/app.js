const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

//added these:
const user = require('./models/user.js');
//=======

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

var isLoggedIn = false;
var checkLogin = function(req, res, next) {
  if (isLoggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.use(require('./middleware/cookieParser'));
app.use(Auth.createSession);


app.get('/', checkLogin,
(req, res) => {
  res.render('index');
});

app.get('/create', 
(req, res) => {
  res.render('index');
});

app.get('/signup', 
(req, res) => {
  console.log(req.headers);
  res.render('signup');
});

app.post('/signup',
(req, res, next) => {
  var username = req.body.username; //will the asynchronous nature cause problems??
  var password = req.body.password;
  //salt and hash password using helper
  //create user in database w/ password and salt
  models.Users.getAll({username: username}).then((results) => {
    if (results.length === 0) {
      //make new user
      models.Users.create({username, password})
        .then((user) => {
          res.redirect('/'); //changed this from login to index (need cookie/session sent)
        })
        .error(error => {
          res.status(500).send(error);
        });
    } else {
      //Error: username already taken
      res.redirect('/signup');
    }
    
  })
  .error(error => {
    res.send(error);
    console.log(error);
  });
  
  // user.create({ username, password})
  
  //(eventually need to create a session and respond with cookie request)
  //or should we just redirect to login page??
  //respond with created 201 status?
  
});

app.get('/login', 
(req, res) => {
  res.render('login');
});


app.post('/login',
(req, res, next) => {
  // get username and password from req.body
  var username = req.body.username;
  var attemptedPassword = req.body.password;
  // see if username valid
  models.Users.getAll( {username: username} ).then((results) => {
    if (results.length !== 0) {
      var salt = results[0].salt;
      var currentPassword = results[0].password;    
      var boolean = models.Users.compare(attemptedPassword, currentPassword, salt);
      if (boolean) {
        //create session
        isLoggedIn = true;
        return models.Sessions.update({ hash: req.session.hash}, { userId: results[0].id});
        
        res.redirect('/');
      } else {
        res.redirect('/login');
      }
    } else {
      res.redirect('/login');
    }
  }).error( error => {
    res.send(error);
    console.log(error);
  });
    //if user name valid
      // hash password with username salt
      //compare hash password and salt with db for that user
        // if password valid
          // create session (helper function auth.js)
          // reidrect to index
        // if not valid
          // stay on login
    // if username not valid stay on login
});


app.get('/links', 
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links', 
(req, res, next) => {

  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/





/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
