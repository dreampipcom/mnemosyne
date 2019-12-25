const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const pkg = require('../../package.json');

module.exports = new JWTStrategy(
  {
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: pkg.name
  },
  (jwtPayload, done) => {
    if (Date.now() > jwtPayload.expires) {
      return done('jwt expired');
    }

    return done(null, jwtPayload);
  }
);
