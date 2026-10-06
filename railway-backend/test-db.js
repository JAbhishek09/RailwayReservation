require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function test() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { ca: fs.readFileSync('./ca.pem') },
  });

  // 1. Show all schedules with their dates and routes
  const [allSchedules] = await pool.query(`
    SELECT s.schedule_id, t.train_number, t.train_name,
           fs.code as from_code, ts.code as to_code,
           s.departure_time, s.arrival_time, s.fare
    FROM schedule s
    JOIN train t    ON t.train_id = s.train_id
    JOIN station fs ON fs.station_id = s.from_station_id
    JOIN station ts ON ts.station_id = s.to_station_id
  `);
  console.log('\n=== ALL SCHEDULES IN DB ===');
  allSchedules.forEach(r => {
    console.log(`  #${r.schedule_id} | ${r.train_number} | ${r.from_code} -> ${r.to_code} | Dep: ${r.departure_time}`);
  });

  // 2. Test the exact search used by app: INDB -> NDLS on today's date (2026-10-06)
  const [todaySearch] = await pool.query(`
    SELECT s.schedule_id, t.train_number
    FROM schedule s
    JOIN train t    ON t.train_id = s.train_id
    JOIN station fs ON fs.station_id = s.from_station_id
    JOIN station ts ON ts.station_id = s.to_station_id
    WHERE fs.code = 'INDB' AND ts.code = 'NDLS' AND DATE(s.departure_time) = '2026-10-06'
  `);
  console.log('\n=== Search INDB->NDLS on 2026-10-06 ===');
  console.log(todaySearch.length > 0 ? JSON.stringify(todaySearch) : '  NO RESULTS');

  // 3. Test on 2026-10-10 (the date seeded in mock data)
  const [oct10Search] = await pool.query(`
    SELECT s.schedule_id, t.train_number
    FROM schedule s
    JOIN train t    ON t.train_id = s.train_id
    JOIN station fs ON fs.station_id = s.from_station_id
    JOIN station ts ON ts.station_id = s.to_station_id
    WHERE fs.code = 'INDB' AND ts.code = 'NDLS' AND DATE(s.departure_time) = '2026-10-10'
  `);
  console.log('\n=== Search INDB->NDLS on 2026-10-10 ===');
  console.log(oct10Search.length > 0 ? JSON.stringify(oct10Search) : '  NO RESULTS');

  await pool.end();
}

test().catch(e => console.error('ERROR:', e.message));

