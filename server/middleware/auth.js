const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  //if req.headers.cookies does not exist
  // console.log(req.body);
  // if (!req.headers.cookie) {
  if (!req.cookies.shortlyid) {
    models.Sessions.create().then((results) => {
      models.Sessions.get({id: results.insertId}).then((results) => {
        req.session = results;
        res.cookie('shortlyid', results.hash);
        // console.log(req);
        // models.Users.get({username: req.body.username}).then((usernameRow) => {
        //   // console.log(results.insertId);
        //   // console.log(usernameRow);
        //   var userId = usernameRow.id;
        //   req.session.user = {
        //     username: req.body.username,
        //     userId: userId
        //   };
          
        //   models.Sessions.update({hash: request.session.hash}, {userId: req.session.user.userId})
        //   .then((result) => {
        //     console.log('success');
        //     next();
        //   }).error((error) => {
        //     console.log(error);
        //   });
        // }).error((error) => {
        //   console.log(error);
        // });
        // assign req.session.userId and req.session.username
        next();
      }).error((error) => {
        console.log(error);
      });
    }).error((error) => {
      console.log(error);
    });
  } else {
    //validate the cookie hash against sessions table
    //we know we have req.cookies.shortlyid (session id hash)
    
    //if valid

    //else not valid

      
    next();
  }
    //create a new hash
    //get user id 
    //add new hash and userid to sessions table
    //set request.session.hash to hashed session value
  //else (if exists)

  
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

//handle a session ID from a page re-enter?
