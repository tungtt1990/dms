// src/config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // VD: postgresql://user:pass@host:port/dbname
  ssl: false
});

module.exports = pool;