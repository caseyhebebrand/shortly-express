const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  //check if there are cookies
  Promise.resolve(req.cookies.shortlyid)
    .then( hash => {
      if (!hash) {
        throw hash;
      }
      return models.Sessions.get({hash});
    })
    .tap( session => {
      if (!session) {
        throw session;
      }
    })
    .catch( () => {
      return models.Sessions.create()
        .then( results => {
          return models.Sessions.get({ id: results.insertId });
        })
        .tap(session => {
          res.cookie('shortlyid', session.hash);
        })
    })
    .then( session => {
      console.log('session', session)
      req.session = session;
      next();
    });
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.verifySession = (req, res, next) => {
  console.log('in verfiy session', req.session);
  if (!models.Sessions.isLoggedIn(req.session)) {
    res.redirect('/login');
  } else {
    next();
  }
};
