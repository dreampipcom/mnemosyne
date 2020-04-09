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
    type: String, required: true
  },
  data:  {
    email: { type: String, default: '', unique: true, required: true },
    paypal: { type: String, default: '', unique: false },
    whatsapp: { type: String, default: '', unique: false, required: true },
    gender: { type: String, default: '3', unique: false, required: true },
    account_type: { type: String, default: '0', unique: false }
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
    title_id: { type: Number, default: 0 },
  },
  title: {
    
  }
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
  console.log(query)
  User.findOne(query, callback);
};

module.exports.User.getUserById = function(id, callback) {
  User.findById(id, callback);
};

module.exports.User.comparePassword = function(candidatePassword, hash, callback) {
  console.log(candidatePassword, hash)
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
};
