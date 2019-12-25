'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pkg = require('../package.json');
const home = require('../app/controllers/home');
const User = mongoose.model('User');
const Bookings = mongoose.model('Bookings');

/**
 * Expose
 */

module.exports = function(app, passport) {
  let corsOpt = {
    origin: 'http://localhost:8080',
    credentials: true
  };

  let isAuth = passport.authenticate('jwt', { session: false });

  app.options('*', cors(corsOpt));
  app.use(cors(corsOpt));

  // app.get('/', home.index);

  // Register User
  // app.post('/api-v1/register', function(req, res) {
  //   var password = req.body.password1;
  //   var password2 = req.body.password2;

  //   if (password == password2) {
  //     var newUser = new User({
  //       name: req.body.name,
  //       email: req.body.email,
  //       username: req.body.username,
  //       password: req.body.password1
  //     });
  //     User.createUser(newUser, function(err, user) {
  //       if (err) throw err;
  //       res.send(user).end();
  //     });
  //   } else {
  //     res
  //       .status(500)
  //       .send('{errors: "Passwords don\'t match"}')
  //       .end();
  //   }
  // });

  // Endpoint to login
  app.post(
    '/api-v1/login',
    passport.authenticate('local', { session: false }),
    function(req, res) {
      let user = req.user;
      if (!user) {
        res.status(400);
      }

      /** This is what ends up in our JWT */
      const payload = {
        username: user.username,
        expires: Date.now() + 24 * 60 * 60 * 1000
      };

      /** assigns payload to req.user */
      req.login(payload, { session: false }, error => {
        if (error) {
          res.status(400).send({ error });
        }

        /** generate a signed json web token and return it in the response */
        const token = jwt.sign(JSON.stringify(payload), pkg.name);

        /** assign our jwt to the cookie */
        res.cookie('jwt', token, { httpOnly: false, secure: false });
        res.status(200).send({ user: user, token: token });
      });
    }
  );

  // Endpoint to get current user data
  app.post('/api-v1/userdata', isAuth, function(req, res) {
    let id = req.user._id;
    User.findById({ _id: id }, (err, user) => {
      user.populate('bookedDates', (err, fullUser) => {
        res.send(fullUser);
      });
    });
  });

  // Endpoint to logout
  app.get('/api-v1/logout', isAuth, function(req, res) {
    req.logout();
    res.send(null);
  });

  // Endpoint to add Bookings data
  app.post('/api-v1/bookings', isAuth, function(req, res) {
    let newBooking = new Bookings({
      ...req.body.payload
    });
    Bookings.addBooking(req.body.id, newBooking, (err, user) => {
      res.send(user).end();
    });
  });

  // Endpoint to delete Bookings data
  app.delete('/api-v1/bookings', isAuth, function(req, res) {
    let id = req.body.id;
    Bookings.deleteBooking(id, () => {
      res.sendStatus(200).end();
    });
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
