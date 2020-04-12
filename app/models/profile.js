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
  username: { type: String, unique: true, required: true },
  password: {
    type: String,
    required: true
  },
  data: {
    email: { type: String, default: '', unique: false, required: true },
    paypal: { type: String, default: '', unique: false },
    whatsapp: { type: String, default: '', unique: false, required: true },
    gender: { type: Number, default: 3, unique: false, required: true },
    account_type: { type: Number, default: 0, unique: false }
  },
  my_helps: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Help' }]
  },
  im_helping: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Help' }]
  },
  stats: {
    points: { type: Number, default: 0 },
    medals: { type: Number, default: 0 },
    trophees: { type: Number, default: 0 },
    title: { type: String, default: 'Apprentice' },
    title_id: { type: Number, default: 0 }
  },
  title: {}
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

// ProfileSchema.method({});
UserSchema.method({});
// StatsSchema.method({});
// TitleSchema.method({});

/**
 * Statics
 */

//ProfileSchema.static({});
UserSchema.static({});
// StatsSchema.static({});
// TitleSchema.static({});

/**
 * Register
 */

let User = (module.exports.User = mongoose.model('User', UserSchema));

User();

module.exports.User.createUser = function(newUser, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

module.exports.User.getUserByUsername = function(username, callback) {
  var query = { username: username };
  User.findOne(query, (err, user) => {
    if (err) throw err;
    callback(null, user);
  });
};

module.exports.User.getUserById = function(id, callback) {
  User.findById(id, callback);
};

module.exports.User.comparePassword = function(
  candidatePassword,
  hash,
  callback
) {
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
};

module.exports.User.editProfile = function(data, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(data.password, salt, function(err, hash) {
      User.findById(data.id, (err, user) => {
        user.username = data.username || user.username;
        user.password = hash || user.password;
        user.data.email = data.data.email || user.data.email;
        user.data.paypal = data.data.paypal || user.data.paypal;
        user.data.whatsapp = data.data.whatsapp || user.data.whatsapp;
        user.data.gender = data.data.gender || user.data.gender;
        user.save((err, saved) => {
          callback(null, saved);
        });
      });
    });
  });
};
