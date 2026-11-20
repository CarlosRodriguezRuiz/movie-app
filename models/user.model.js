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

/**
 * Busca un usuario por email. Devuelve también la contraseña (hash):
 * la necesita el login para compararla con bcrypt.
 * @param {string} email
 * @returns {Promise<User|undefined>} el usuario, o undefined si no existe
 */
const getByEmail = async (email) => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

/**
 * Crea un usuario. Lo usan el signup, el login con Google y el admin.
 * @param {string} name
 * @param {string} email
 * @param {string|null} password - hash bcrypt (null si entra con Google)
 * @param {'local'|'google'} [provider='local']
 * @param {'user'|'admin'} [role='user'] - solo el admin lo cambia; signup y Google usan 'user'
 * @returns {Promise<User>} el usuario creado (sin contraseña)
 */
const create = async (name, email, password, provider = 'local', role = 'user') => {
  const { rows } = await query(
    `INSERT INTO users (name, email, password, provider, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, provider`,
    // Un valor por cada $, en el mismo orden: $1 name, $2 email, $3 password, $4 provider, $5 role
    [name, email, password, provider, role]
  );
  return rows[0];
};

/**
 * Busca un usuario por su id. NO devuelve la contraseña.
 * @param {number} id
 * @returns {Promise<User|undefined>} el usuario, o undefined si no existe
 */
const getById = async (id) => {
  const { rows } = await query('SELECT id, name, email, role, provider FROM users WHERE id = $1', [
    id,
  ]);
  return rows[0];
};

/**
 * Cambia el nombre y el email de un usuario (perfil propio: no deja cambiar el rol).
 * @param {number} id
 * @param {string} name
 * @param {string} email
 * @returns {Promise<User|undefined>} el usuario ya cambiado, o undefined si no existe
 */
const update = async (id, name, email) => {
  const { rows } = await query(
    `UPDATE users SET name = $1, email = $2
     WHERE id = $3
     RETURNING id, name, email, role, provider`,
    [name, email, id]
  );
  return rows[0];
};

/**
 * Lista de todos los usuarios para el panel del admin. NO devuelve contraseñas.
 * @returns {Promise<User[]>} ordenados por id (el más antiguo primero)
 */
const getAll = async () => {
  // Nunca "SELECT *": así la contraseña (aunque sea un hash) no sale de la BBDD.
  const { rows } = await query('SELECT id, name, email, role, provider FROM users ORDER BY id');
  return rows;
};

/**
 * El admin cambia nombre, email y rol de un usuario.
 * @param {number} id
 * @param {string} name
 * @param {string} email
 * @param {'user'|'admin'} role
 * @returns {Promise<User|undefined>} el usuario cambiado, o undefined si no existe
 */
const updateByAdmin = async (id, name, email, role) => {
  const { rows } = await query(
    `UPDATE users SET name = $1, email = $2, role = $3
     WHERE id = $4
     RETURNING id, name, email, role, provider`,
    // Mismo orden que los $: $1 name, $2 email, $3 role, $4 id
    [name, email, role, id]
  );
  return rows[0];
};

/**
 * Borra un usuario. Sus favoritos se borran solos:
 * la tabla favorites tiene "REFERENCES users(id) ON DELETE CASCADE".
 * @param {number} id
 * @returns {Promise<number>} 1 si lo ha borrado, 0 si no existía
 */
const remove = async (id) => {
  // DELETE no devuelve filas: lo que interesa es cuántas ha borrado (rowCount).
  const { rowCount } = await query('DELETE FROM users WHERE id = $1', [id]);
  return rowCount;
};

module.exports = { getByEmail, create, getById, update, getAll, updateByAdmin, remove };
