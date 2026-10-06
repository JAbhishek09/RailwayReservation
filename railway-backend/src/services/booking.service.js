const pool = require('../db');
const AppError = require('../errors');

async function createBooking({ userId, scheduleId, passengers, idempotencyKey, mode }) {
  if (!userId || !scheduleId || !idempotencyKey || !Array.isArray(passengers) || !passengers.length) {
    throw new AppError(400, 'userId, scheduleId, idempotencyKey and passengers are required');
  }
  if (passengers.length > 6) throw new AppError(400, 'Max 6 passengers per booking');

  const conn = await pool.getConnection();   // one connection for the whole transaction
  try {
    await conn.beginTransaction();

    // 1. Same request sent twice? Return the old booking.
    const [dup] = await conn.query(
      'SELECT booking_id FROM booking WHERE idempotency_key = ?', [idempotencyKey]);
    if (dup.length) {
      await conn.commit();
      return getBooking(dup[0].booking_id);
    }

    // 2. Find the fare
    const [[schedule]] = await conn.query(
      'SELECT fare FROM schedule WHERE schedule_id = ?', [scheduleId]);
    if (!schedule) throw new AppError(404, 'Schedule not found');

    // 3. Lock free seats (skip any seat another booking is holding right now)
    const [seats] = await conn.query(
      `SELECT seat_id FROM schedule_seat
       WHERE schedule_id = ? AND status = 'AVAILABLE'
       ORDER BY seat_id
       LIMIT ?
       FOR UPDATE SKIP LOCKED`,
      [scheduleId, passengers.length]
    );

    // 4. Create the booking
    const total = Number(schedule.fare) * passengers.length;
    const [b] = await conn.query(
      `INSERT INTO booking (user_id, schedule_id, total_fare, idempotency_key)
       VALUES (?, ?, ?, ?)`,
      [userId, scheduleId, total, idempotencyKey]
    );
    const bookingId = b.insertId;

    // 5. Each passenger gets a seat, or goes to the waitlist
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      const seat = seats[i];           // undefined when seats ran out
      const status = seat ? 'CONFIRMED' : 'WAITLISTED';

      const [bp] = await conn.query(
        `INSERT INTO booking_passenger (booking_id, name, age, gender, status)
         VALUES (?, ?, ?, ?, ?)`,
        [bookingId, p.name, p.age, p.gender, status]
      );
      if (seat) {
        await conn.query(
          `UPDATE schedule_seat SET status = 'BOOKED', bp_id = ?
           WHERE schedule_id = ? AND seat_id = ?`,
          [bp.insertId, scheduleId, seat.seat_id]
        );
      }
    }

    // 6. Mock payment
    await conn.query(
      `INSERT INTO payment (booking_id, amount, mode, status)
       VALUES (?, ?, ?, 'SUCCESS')`,
      [bookingId, total, mode || 'UPI']
    );

    await conn.commit();
    return getBooking(bookingId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();                    // ALWAYS give the connection back
  }
}

async function getBooking(bookingId) {
  const [[booking]] = await pool.query(
    'SELECT * FROM booking WHERE booking_id = ?', [bookingId]);
  if (!booking) throw new AppError(404, 'Booking not found');

  const [passengers] = await pool.query(
    `SELECT bp.bp_id, bp.name, bp.age, bp.gender, bp.status,
            c.coach_code, s.seat_number
     FROM booking_passenger bp
     LEFT JOIN schedule_seat ss ON ss.bp_id = bp.bp_id
     LEFT JOIN seat s  ON s.seat_id = ss.seat_id
     LEFT JOIN coach c ON c.coach_id = s.coach_id
     WHERE bp.booking_id = ?`,
    [bookingId]
  );

  // Include schedule + train info so the frontend can display train name/route
  const [[schedule]] = await pool.query(
    `SELECT s.schedule_id, t.train_number, t.train_name,
            fs.name AS from_station, fs.code AS from_code,
            ts.name AS to_station, ts.code AS to_code,
            s.departure_time, s.arrival_time, s.fare,
            (SELECT COUNT(*) FROM schedule_seat ss2
             WHERE ss2.schedule_id = s.schedule_id AND ss2.status = 'AVAILABLE') AS available_seats
     FROM schedule s
     JOIN train t    ON t.train_id = s.train_id
     JOIN station fs ON fs.station_id = s.from_station_id
     JOIN station ts ON ts.station_id = s.to_station_id
     WHERE s.schedule_id = ?`,
    [booking.schedule_id]
  );

  return { ...booking, passengers, schedule: schedule || null };
}

async function getUserBookings(userId) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'Invalid userId');

  const [rows] = await pool.query(
    'SELECT booking_id FROM booking WHERE user_id = ? ORDER BY created_at DESC, booking_id DESC',
    [id]);
  return Promise.all(rows.map((r) => getBooking(r.booking_id)));
}

async function cancelBooking(bookingId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[booking]] = await conn.query(
      'SELECT booking_id, schedule_id FROM booking WHERE booking_id = ? FOR UPDATE',
      [bookingId]);
    if (!booking) throw new AppError(404, 'Booking not found');

    const [people] = await conn.query(
      `SELECT bp_id, status FROM booking_passenger
       WHERE booking_id = ? AND status <> 'CANCELLED'`, [bookingId]);
    if (!people.length) throw new AppError(409, 'Already cancelled');

    // Cancel every passenger of this booking up front. Otherwise the waitlist
    // promotion below could hand a freed seat to another passenger of the SAME
    // booking, who would then be cancelled with a stale status and leak the seat.
    await conn.query(
      "UPDATE booking_passenger SET status = 'CANCELLED' WHERE booking_id = ? AND status <> 'CANCELLED'",
      [bookingId]);

    for (const p of people) {
      if (p.status !== 'CONFIRMED') continue;   // waitlisted people have no seat to free

      // Find the seat this passenger was holding
      const [[seat]] = await conn.query(
        'SELECT seat_id FROM schedule_seat WHERE bp_id = ? FOR UPDATE', [p.bp_id]);

      // Oldest waiting passenger on this same journey
      const [waiting] = await conn.query(
        `SELECT bp.bp_id FROM booking_passenger bp
         JOIN booking b ON b.booking_id = bp.booking_id
         WHERE b.schedule_id = ? AND bp.status = 'WAITLISTED'
         ORDER BY bp.created_at, bp.bp_id
         LIMIT 1
         FOR UPDATE SKIP LOCKED`,
        [booking.schedule_id]
      );

      if (waiting.length) {
        // Give the seat straight to the waiting passenger
        await conn.query(
          'UPDATE schedule_seat SET bp_id = ? WHERE schedule_id = ? AND seat_id = ?',
          [waiting[0].bp_id, booking.schedule_id, seat.seat_id]);
        await conn.query(
          "UPDATE booking_passenger SET status = 'CONFIRMED' WHERE bp_id = ?",
          [waiting[0].bp_id]);
      } else {
        await conn.query(
          `UPDATE schedule_seat SET status = 'AVAILABLE', bp_id = NULL
           WHERE schedule_id = ? AND seat_id = ?`,
          [booking.schedule_id, seat.seat_id]);
      }
    }

    // Simple rule: full refund
    await conn.query(
      "UPDATE payment SET status = 'REFUNDED' WHERE booking_id = ? AND status = 'SUCCESS'",
      [bookingId]);

    await conn.commit();
    return getBooking(bookingId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { createBooking, getBooking, getUserBookings, cancelBooking };