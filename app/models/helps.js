const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Profile = require('./profile');

const BookingsSchema = Schema({
  country: { type: String, required: true },
  city: { type: String, required: true },
  date: { type: Date, required: true },
  project: { type: String, required: true },
  format: { type: String, required: true },
  link: String
});

let Bookings = (module.exports = mongoose.model('Bookings', BookingsSchema));

Bookings();

module.exports.addBooking = function(userId, bookingData, callback) {
  bookingData.save((err, booking) => {
    console.log(booking);
    Profile.findById({ _id: PId }, (err, user) => {
      user.bookedDates.push(booking);
      user.save(callback);
    });
  });
};

module.exports.editBooking = function(bookingId, bookingData, callback) {
  bookingData = bookingData.payload;
  let query = { _id: bookingId };
  Bookings.findOne(query, (err, booking) => {
    booking.country = bookingData.country;
    booking.city = bookingData.city;
    booking.project = bookingData.project;
    booking.link = bookingData.link;
    booking.date = bookingData.date;
    booking.format = bookingData.format;

    console.log('new', booking);
    booking.save(callback);
  });
};

module.exports.deleteBooking = function(bookingId, callback) {
  let query = { _id: bookingId };
  Bookings.findByIdAndDelete(query, callback);
};
