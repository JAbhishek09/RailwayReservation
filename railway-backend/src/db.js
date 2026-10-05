require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

module.exports = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { ca: fs.readFileSync('./ca.pem') },
  waitForConnections: true,
  connectionLimit: 10,
});
