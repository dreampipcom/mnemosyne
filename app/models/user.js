/*!
 * Module dependencies
 */
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User schema
 */

const UserSchema = new Schema({
  name: { type: String, default: '' },
  username: { type: String, unique: true },
  email: { type: String, default: '', unique: true },
  password: {
    type: String
  },
  bookedDates: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Bookings' }]
  }
});

const BookingsSchema = Schema({
  country: String,
  city: String,
  date: Date,
  project: String,
  link: String
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */

UserSchema.method({});

/**
 * Statics
 */

UserSchema.static({});

/**
 * Register
 */

let User = (module.exports = mongoose.model('User', UserSchema));
let Bookings = mongoose.model('Bookings', BookingsSchema);

User();
Bookings();

module.exports.createUser = function(newUser, callback) {
  console.log('create user', newUser);
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

module.exports.getUserByUsername = function(username, callback) {
  var query = { username: username };
  User.findOne(query, callback);
};

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
};
