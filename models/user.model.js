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

/**
 * Busca un usuario por su id. NO devuelve la contraseña.
 * @param {number} id
 * @returns {Promise<User|undefined>} el usuario, o undefined si no existe
 */
const getById = async (id) => {
  const {rows} = await query (`select id, name, email, role, provider from users where id = $1`,[id]

  );
  return rows[0];
}

/**
 * Cambia el nombre y el email de un usuario.
 * @param {number} id
 * @param {string} name
 * @param {string} email
 * @returns {Promise<User|undefined>} el usuario ya cambiado, o undefined si no existe
 */
const update = async (id, name, email) => {
  const { rows } = await query(
    `UPDATE users set name = $1, email = $2
     where id = $3
     RETURNING id, name, email, role, provider`,
    [name, email, id]
  );
  return rows[0];
};

module.exports = { getByEmail, create, getById, update };
