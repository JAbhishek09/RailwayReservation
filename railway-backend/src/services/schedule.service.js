pool = require('../db');

async function search([from , to , date]){
  const [rows] = await pool.query(
    `SELECT s.schedule_id, t.train_number, t.train_name,
            fs.name AS from_station, ts.name AS to_station,
            s.departure_time, s.arrival_time, s.fare,
            (SELECT COUNT(*) FROM schedule_seat ss
              WHERE ss.schedule_id = s.schedule_id
                AND ss.status = 'AVAILABLE') AS available_seats
     FROM schedule s
     JOIN train t     ON t.train_id = s.train_id
     JOIN station fs  ON fs.station_id = s.from_station_id
     JOIN station ts  ON ts.station_id = s.to_station_id
     WHERE fs.code = ? AND ts.code = ? AND DATE(s.departure_time) = ?`,
    [from, to, date]
  );
  return rows;
}
module.exports = { search };