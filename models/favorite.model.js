/**
 * Consultas SQL de favoritos (tabla "favorites", ver db/schema.sql). Responsable: Persona 3.
 * Solo se guarda la RELACIÓN usuario <-> película (movie_id + source), nunca los datos de la película.
 * @module models/favorite
 */
// eslint-disable-next-line no-unused-vars
const { query } = require('../config/db.sql');

// TODO (Persona 3): getByUser(userId), add(userId, movieId, source), remove(userId, movieId, source),
//                   removeByMovie(movieId, 'mongo') -> al borrar una peli de Mongo

module.exports = {};
