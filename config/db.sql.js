/**
 * Conexión a PostgreSQL (usuarios y favoritos).
 * Usa las variables PGHOST, PGPORT, PGUSER, PGPASSWORD y PGDATABASE del .env
 * (pg las lee automáticamente).
 * @module config/db.sql
 */
const { Pool } = require('pg');

const pool = new Pool();

/**
 * Ejecuta una consulta SQL parametrizada.
 * Usa SIEMPRE parámetros ($1, $2...) para evitar inyección SQL.
 * @param {string} text - Consulta SQL.
 * @param {Array} [params] - Valores de los parámetros.
 * @returns {Promise<import('pg').QueryResult>}
 * @example
 * const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
 */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
