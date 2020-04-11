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
const Help = mongoose.model('Help');
const CircularJSON = require('circular-json');



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
  app.post('/api-v1/register', function(req, res) {
    var password = req.body.password;
    var password2 = req.body.password_verify;

    if (password && password.length >= 6 && password2 && password === password2) {
      var newUser = new User({
        username: req.body.username,
        password: password,
        data: {
          email: req.body.email,
          paypal: req.body.paypal,
          whatsapp: req.body.whatsapp,
          gender: req.body.gender,
        }
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

  app.post('/api-v1/check-user', function(req, res) {
    let username = req.body.candidate
    User.getUserByUsername(username, (err, user) => {
      if (user) {
        res.send({valid: false}).end()
      } else {
        res.send({valid: true}).end()
      }
    })
  })

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
        //res.cookie('jwt', token, { httpOnly: true, secure: process.env.IS_SECURE });
        res.status(200).send({ username: user.username, token: token });
      });
    }
  );

  // Endpoint to get current user data
  app.post('/api-v1/userdata', isAuth, function(req, res) {
    let id = req.user._id;
    User.findById({ _id: id }, (err, user) => {
      user.populate('my_helps', (err, partialUser) => {
        partialUser.populate('im_helping', (err, fullUser) => {
          res.send(fullUser);
        });
      });
    });
  });

  // Endpoint to logout
  app.get('/api-v1/logout', isAuth, function(req, res) {
    req.logout();
    return res.send({ authenticated: req.isAuthenticated() });
  });

  // // Endpoint to get Bookings data
  // app.get('/api-v1/bookings', function(req, res) {
  //   let username = (req.user && req.user.username) || process.env.PUBLIC_USER;
  //   User.getUserByUsername(username, (err, user) => {
  //     user.populate('bookedDates', (err, fullUser) => {
  //       // let dateOffset = 24 * 60 * 60 * 1000 * 2; //2 days
  //       let now = new Date(new Date().setDate(new Date().getDate() - 2));
  //       let nextDates = fullUser.bookedDates.filter(el => {
  //         return (
  //           el.date > now &&
  //           el.date.getUTCFullYear() <= now.getUTCFullYear() + 1
  //         );
  //       });
  //       var separatedDates = [];
  //       nextDates.forEach(el => {
  //         var year = el.date.getUTCFullYear().toString();
  //         var existingYears = separatedDates.map(el => Object.keys(el)[0]);
  //         if (existingYears.indexOf(year) === -1) {
  //           separatedDates.push({ [year]: [] });
  //         }
  //         existingYears = separatedDates.map(el => Object.keys(el)[0]);

  //         let index = -1;
  //         separatedDates.forEach((date, i) => {
  //           if (Object.keys(date)[0] == year)
  //             index = existingYears.indexOf(year);
  //         });
  //         separatedDates[index][year].push(el);
  //       });
  //       let orderedArrayByYear = separatedDates.sort(function(a, b) {
  //         return Object.keys(a)[0] - Object.keys(b)[0];
  //       });
  //       let orderedArrayByEvents = orderedArrayByYear.map(el => {
  //         return {
  //           [Object.keys(el)[0]]: el[Object.keys(el)[0]].sort(function(a, b) {
  //             return a.date - b.date;
  //           })
  //         };
  //       });
  //       res.send(orderedArrayByEvents);
  //     });
  //   });
  // });

  // Endpoint to get ALL Bookings data
  // app.get('/api-v1/all-helps', isAuth, function(req, res) {
  //   let username = (req.user && req.user.username) || process.env.PUBLIC_USER;
  //   User.getUserByUsername(username, (err, user) => {
  //     user.populate('bookedDates', (err, fullUser) => {
  //       let nextDates = fullUser.bookedDates;
  //       var separatedDates = [];
  //       nextDates.forEach(el => {
  //         var year = el.date.getUTCFullYear().toString();
  //         var existingYears = separatedDates.map(el => Object.keys(el)[0]);
  //         if (existingYears.indexOf(year) === -1) {
  //           separatedDates.push({ [year]: [] });
  //         }
  //         existingYears = separatedDates.map(el => Object.keys(el)[0]);

  //         let index = -1;
  //         separatedDates.forEach((date, i) => {
  //           if (Object.keys(date)[0] == year)
  //             index = existingYears.indexOf(year);
  //         });
  //         separatedDates[index][year].push(el);
  //       });
  //       let orderedArrayByYear = separatedDates.sort(function(a, b) {
  //         return Object.keys(a)[0] - Object.keys(b)[0];
  //       });
  //       let orderedArrayByEvents = orderedArrayByYear.map(el => {
  //         return {
  //           [Object.keys(el)[0]]: el[Object.keys(el)[0]].sort(function(a, b) {
  //             return a.date - b.date;
  //           })
  //         };
  //       });
  //       res.send(orderedArrayByEvents);
  //     });
  //   });
  // });

  // app.get('/api-v1/all-helps', isAuth, function(req, res) {
  //   Help.find((err, helps) => {
  //       helps.populate('who_is_helping.user', (err, fullHelp) => {
  //         res.send(fullHelp);
  //       });
  //   });
  // });
  app.post('/api-v1/all-helps/:page', isAuth,  function(req, res) {
    let page = req.params.page || 1
    let limit = 5
    let start = page > 1 ? (page - 1) * (limit - 1) : 0
    let end = page > 1 ? ((limit * page) - 1) : 4
    let location = req.body.location || { lat: 0, lng: 0 }
    let all_helps = []
    getDistancedHelps(location, page, 10, req.user ,(err, helps) => {
      let paginated = helps.length >= end ? helps.slice( start, end ) : []
      res.send({"docs": paginated});
    })
  })

  app.get('/api-v1/help/:id', isAuth,  function(req, res) {
    Help.findOne({ _id: req.params.id }, (err, help) => { 
      help.populate('user',  (err, fullhelp) => {
          res.send(fullhelp);
      })
    })
  })

  function getDistancedHelps(currentLocation, pageNumber, nPerPage, uid, callback) {
    Help.paginate({"stats.completed":  false, "user": { $ne: uid } }, {sort:"-createdAt", limit: 200, populate: "user"})
    .then((results) => {
      let ordered = results.docs.sort((a, b) => {
        if (currentLocation) {
          let distanceA = distance(Number(currentLocation.lat), Number(currentLocation.lng), Number(a.location.lat), Number(a.location.lng), "K")
          let distanceB = distance(Number(currentLocation.lat), Number(currentLocation.lng), Number(b.location.lat), Number(b.location.lng), "K")
          return distanceA - distanceB
        } else {
          return a.createdAt - b.createdAt
        }
      })
      callback(null, ordered)
    })
  }

  function distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 === lat2) && (lon1 === lon2)) {
      return 0
    } else {
      var radlat1 = Math.PI * lat1 / 180
      var radlat2 = Math.PI * lat2 / 180
      var theta = lon1 - lon2
      var radtheta = Math.PI * theta / 180
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
      if (dist > 1) {
        dist = 1
      }
      dist = Math.acos(dist)
      dist = dist * 180 / Math.PI
      dist = dist * 60 * 1.1515
      if (unit === "K") { dist = dist * 1.609344 }
      if (unit === "N") { dist = dist * 0.8684 }
      return dist
    }
  }


  

  // Endpoint to add Help data
  app.post('/api-v1/help', isAuth, function(req, res) {
    let newHelp = new Help({
      ...req.body.payload
    });
    Help.addHelp(req.body.id, newHelp, (err, user) => {
      if (err) {
        res.status(500).send(err).end()
      }
      res.send(user).end();
    });
  });


  // Endpoint to asusme help
  app.post('/api-v1/assume-help', isAuth, function(req, res) {
      let help_id = req.body.payload.help_id
      let uid = req.body.uid
      
      Help.findOne({_id:help_id}, (err, help) => {
        let already = help.who_is_helping.findIndex(el => {
          return el.user === uid
        })
        if (help.user._id == uid) {
          res.status(403).send({ message: "Can't help yourself!" })
        } else if (already > -1) {
          res.status(403).send({ message: "Can't help twice!" })
        } else {
          Help.assumeHelp(help_id, help, req.body.uid, (err, help) => {
            res.send(help).end();
          });
        }
      })
  });

  // Endpoint to asusme help
  app.post('/api-v1/evaluate-help', isAuth, function(req, res) {
    let help_id = req.body.help_id
    let helper_id = req.body.helper_id
    let payload = req.body.new_status
    
      Help.evaluateHelp(help_id, helper_id, payload, (err, help) => {
        res.send(help).end();
      });
});

// Endpoint to asusme help
app.post('/api-v1/complete-help', isAuth, function(req, res) {
  let help_id = req.body.help_id
  Help.completeHelp(help_id, (err, help) => {
    res.send(help.stats.completed).end();
  });
});

  // // Endpoint to add Bookings data
  // app.put('/api-v1/bookings', isAuth, function(req, res) {
  //   Bookings.editBooking(req.body.id, req.body.payload, (err, booking) => {
  //     res.send(booking).end();
  //   });
  // });

  // // Endpoint to delete Bookings data
  // app.delete('/api-v1/bookings', isAuth, function(req, res) {
  //   let id = req.body.id;
  //   Bookings.deleteBooking(id, () => {
  //     res.sendStatus(200).end();
  //   });
  // });

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
