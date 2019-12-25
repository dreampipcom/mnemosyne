const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');

const BookingsSchema = Schema({
  country: { type: String, required: true },
  city: { type: String, required: true },
  date: { type: Date, required: true },
  project: { type: String, required: true },
  link: String
});

let Bookings = (module.exports = mongoose.model('Bookings', BookingsSchema));

Bookings();

module.exports.addBooking = function(userId, bookingData, callback) {
  bookingData.save((err, booking) => {
    console.log(booking);
    User.findById({ _id: userId }, (err, user) => {
      console.log(user);
      user.bookedDates.push(booking);
      user.save(callback);
    });
  });
};

module.exports.editBooking = function(bookingId, bookingData, callback) {
  let query = { _id: bookingId };
  Bookings.findOneAndUpdate(query, bookingData, callback);
};

module.exports.deleteBooking = function(bookingId, callback) {
  let query = { _id: bookingId };
  Bookings.findByIdAndDelete(query, callback);
};
