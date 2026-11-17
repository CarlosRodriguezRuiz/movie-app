/**
 * Crea las tablas de PostgreSQL y mete los usuarios de prueba.
 * Uso: npm run db:init   (⚠️ borra los datos que hubiera)
 * Antes crea la base de datos vacía: CREATE DATABASE movie_app;
 */
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db.sql');

const run = async () => {
  for (const file of ['schema.sql', 'seed.sql']) {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'db', file), 'utf8');
    await pool.query(sql);
    console.log(`✅ ${file} ejecutado`);
  }
};

run()
  .catch((err) => {
    console.error('❌ Error inicializando la BBDD:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
