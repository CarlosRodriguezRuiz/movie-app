/**
 * Consultas SQL de usuarios (tabla "users", ver db/schema.sql). Responsable: Persona 1 (Auth y usuarios).
 * @module models/user
 */
// eslint-disable-next-line no-unused-vars
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

module.exports = {};
