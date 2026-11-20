/**
 * Consultas SQL de favoritos (tabla "favorites", ver db/schema.sql). Responsable: Persona 3.
 * Solo se guarda la RELACIÓN usuario <-> película (movie_id + source), nunca los datos de la película.
 * @module models/favorite
 */
const { query } = require('../config/db.sql');

// TODO (Persona 3): getByUser(userId), add(userId, movieId, source), remove(userId, movieId, source)

/**
 * VER: devuelve los favoritos de un usuario.
 * Lo usa el controlador para pintar "Mis películas" y para GET /api/favorites.
 * @param {number} userId - id del usuario logueado (sale del token, req.user.id)
 * @returns {Promise<{movie_id: string, source: 'omdb'|'mongo'}[]>} lista ([] si no tiene)
 */
const getByUser = async (userId) => {
  const { rows } = await query(
    `SELECT movie_id, source FROM favorites WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

const add = async (userId, movieId, source) => {
  const { rows } = await query(
    `INSERT INTO favorites(user_id, movie_id, source) VALUES ($1, $2, $3)  ON CONFLICT (user_id, movie_id, source) DO NOTHING
     RETURNING id, movie_id, source`,
    [userId, movieId, source]
  );
  return rows[0] || null;
};

const remove = async (userId, movieId, source) => {
  const { rowCount } = await query(
    `DELETE FROM favorites WHERE user_id = $1  AND movie_id = $2 AND source = $3`,
    [userId, movieId, source]
  );
  return rowCount;
};

/**
 * Borra una película de los favoritos de TODOS los usuarios.
 * Se usa al borrar una película del admin (Mongo), para que no queden favoritos "huérfanos".
 * @param {string} movieId - _id de MongoDB (o imdbID si fuera de OMDB)
 * @param {'omdb'|'mongo'} source - de dónde viene la película
 * @returns {Promise<number>} cuántos favoritos se han borrado (0 si nadie la tenía)
 */
const removeByMovie = async (movieId, source) => {
  const { rowCount } = await query('DELETE FROM favorites WHEREuser movie_id = $1 AND source = $2', [
    movieId,
    source,
  ]);
  return rowCount;
};

module.exports = { getByUser, add, remove,removeByMovie};
