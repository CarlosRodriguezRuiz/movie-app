/**
 * Consultas SQL de usuarios (tabla "users", ver db/schema.sql). Responsable: Persona 1 (Auth y usuarios).
 * @module models/user
 */

const { query } = require('../config/db.sql');

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string|null} password - hash bcrypt (null si entró por OAuth)
 * @property {'user'|'admin'} role
 * @property {'local'|'google'} provider
 */

// TODO (Persona 1): getAll, getById, getByEmail, create, update, remove

const getByEmail = async (email) => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

const create = async (name, email, password, provider = 'local') => {
  const { rows } = await query(
    `INSERT INTO users (name, email, password, provider)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role`,
    [name, email, password, provider]
  );
  return rows[0];
};

module.exports = { getByEmail, create };
