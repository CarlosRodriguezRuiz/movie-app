/**
 * Consultas SQL de favoritos (tabla "favorites", ver db/schema.sql). Responsable: Persona 3.
 * Solo se guarda la RELACIÓN usuario <-> película (movie_id + source), nunca los datos de la película.
 * @module models/favorite
 */
const { query } = require('../config/db.sql');

// TODO (Persona 3): getByUser(userId), add(userId, movieId, source), remove(userId, movieId, source)

/**
 * Borra una película de los favoritos de TODOS los usuarios.
 * Se usa al borrar una película del admin (Mongo), para que no queden favoritos "huérfanos".
 * @param {string} movieId - _id de MongoDB (o imdbID si fuera de OMDB)
 * @param {'omdb'|'mongo'} source - de dónde viene la película
 * @returns {Promise<number>} cuántos favoritos se han borrado (0 si nadie la tenía)
 */
const removeByMovie = async (movieId, source) => {
  const { rowCount } = await query('DELETE FROM favorites WHERE movie_id = $1 AND source = $2', [
    movieId,
    source,
  ]);
  return rowCount;
};

module.exports = { removeByMovie };
