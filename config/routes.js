'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const home = require('../app/controllers/home');
const User = mongoose.model('User');
const cors = require('cors');

/**
 * Expose
 */

module.exports = function(app, passport) {
  app.use(cors());

  app.get('/', home.index);

  // Register User
  app.post('/api-v1/register', function(req, res) {
    var password = req.body.password1;
    var password2 = req.body.password2;

    if (password == password2) {
      var newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password1
      });
      User.createUser(newUser, function(err, user) {
        if (err) throw err;
        res.send(user).end();
      });
    } else {
      res
        .status(500)
        .send('{errors: "Passwords don\'t match"}')
        .end();
    }
  });

  // Endpoint to login
  app.post('/api-v1/login', passport.authenticate('local'), function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.sendStatus(200);
    res.send(req.user);
  });

  // Endpoint to get current user
  app.get('/api-v1/user', function(req, res) {
    res.send(req.user);
  });

  // Endpoint to logout
  app.get('/api-v1/logout', function(req, res) {
    req.logout();
    res.send(null);
  });

  /**
   * Error handling
   */

  app.use(function(err, req, res, next) {
    // treat as 404
    if (
      err.message &&
      (~err.message.indexOf('not found') ||
        ~err.message.indexOf('Cast to ObjectId failed'))
    ) {
      return next();
    }
    console.error(err.stack);
    // error page
    res.status(500).render('500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function(req, res) {
    res.status(404).render('404', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });
};
