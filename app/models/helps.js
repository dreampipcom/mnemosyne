const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Profile = require('./profile');

const HelpSchema = Schema({
  user: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  stats: {
    views: { type: Number, default: 0 },
    clicked_message: { type: Number, default: 0 },
    clicked_donate: { type: Number, default: 0 },
    clicked_message: { type: Number, default: 0 },
    amount_raised: 0,
    completed:{ type: Boolean, default: false }
  },
  category: {
    main_category: { type: String, default: 'Other', required: true },
    main_category_id: { type: Number, default: 0, required: true },
    custom_description: { type: String, required: true },
    custom_link: { type: String, required: false },
    urgency: { type: Number, required: true }
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    place_name: { type: String, required: true },
  },
  reward: { 
    value: { type: Number, required: false },
    type: { type: Number, required: true },
    other_reward: { type: String, required: false }
  },
  who_is_helping: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    hasHelped: { type: Boolean, default: 0 }
  }]
});


let Help = (module.exports = mongoose.model('Help', HelpSchema));

Help();

module.exports.addHelp = function(userId, helpData, callback) {
  Profile.User.findById({ _id: userId }, (err, user) => {
    helpData.user.push(user)
    helpData.save((err, help) => {
      console.log(help);
      Profile.User.findById({ _id: userId }, (err, user) => {
        user.my_helps.push(help);
        user.save(callback);
      });
    });
  });
};

// module.exports.editBooking = function(bookingId, helpData, callback) {
//   helpData = helpData.payload;
//   let query = { _id: bookingId };
//   Help.findOne(query, (err, booking) => {
//     booking.country = helpData.country;
//     booking.city = helpData.city;
//     booking.project = helpData.project;
//     booking.link = helpData.link;
//     booking.date = helpData.date;
//     booking.format = helpData.format;

//     console.log('new', booking);
//     booking.save(callback);
//   });
// };

// module.exports.deleteBooking = function(bookingId, callback) {
//   let query = { _id: bookingId };
//   Help.findByIdAndDelete(query, callback);
// };
