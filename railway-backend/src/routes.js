const express = require('express');
const schedules = require('./services/schedule.service');
const bookings = require('./services/booking.service');
const pool = require('./db');

const router = express.Router();
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next); // sends errors to the error handler

router.get('/stations', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT station_id, code, name, city FROM station');
  res.json(rows);
}));

router.get('/schedules', wrap(async (req, res) => {
  const { from, to, date } = req.query;
  res.json(await schedules.search(from, to, date));
}));

router.post('/bookings', wrap(async (req, res) => {
  const result = await bookings.createBooking(req.body);
  res.status(201).json(result);
}));

router.get('/bookings/:id', wrap(async (req, res) => {
  res.json(await bookings.getBooking(req.params.id));
}));

router.get('/users/:userId/bookings', wrap(async (req, res) => {
  res.json(await bookings.getUserBookings(req.params.userId));
}));

router.post('/bookings/:id/cancel', wrap(async (req, res) => {
  res.json(await bookings.cancelBooking(req.params.id));
}));

module.exports = router;