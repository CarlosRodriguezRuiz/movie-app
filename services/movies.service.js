/**
 * Búsqueda unificada OMDB -> MongoDB. Responsable: Persona 2 (Búsqueda).
 * Regla del enunciado: 1) OMDB; 2) si no hay nada, MongoDB; 3) si tampoco, lista vacía.
 * Nunca se guardan en BBDD los datos que vienen de OMDB.
 * @module services/movies
 */

/**
 * @param {string} title
 * @returns {Promise<import('./omdb.service').Movie[]>}
 */
const search = async (title) => {
  // TODO (Persona 2)
  throw new Error('movies.search no implementado');
};

/**
 * Devuelve una película por id y origen. Lo usan la vista detalle y Favoritos (Persona 3).
 * @param {string} id
 * @param {'omdb'|'mongo'} source
 * @returns {Promise<import('./omdb.service').Movie|null>}
 */
const getById = async (id, source) => {
  // TODO (Persona 2)
  throw new Error('movies.getById no implementado');
};

module.exports = { search, getById };
