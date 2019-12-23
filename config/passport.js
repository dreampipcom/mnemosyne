'use strict';

/*
 * Module dependencies.
 */

const mongoose = require('mongoose');
const local = require('./passport/local');

const User = mongoose.model('User');

/**
 * Expose
 */

module.exports = function(passport) {
  // serialize and deserialize sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });

  // use these strategies
  passport.use(local);
};
