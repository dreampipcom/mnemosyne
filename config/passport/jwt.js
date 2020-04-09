const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const pkg = require('../../package.json');
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = new JWTStrategy(
  {
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: pkg.name
  },
  (jwtPayload, done) => {
    if (Date.now() > jwtPayload.expires) {
      return done('jwt expired');
    }
    User.getUserByUsername(jwtPayload.username, function(err, user) {
      if (err) throw err;
      if (user) {
        return done(null, user);
      }
    });
  }
);
