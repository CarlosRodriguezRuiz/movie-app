/**
 * Servicio OMDB. Responsable: Persona 2 (Búsqueda).
 * Docs de la API: http://www.omdbapi.com/
 * Node 22 trae fetch de serie, no hace falta axios.
 * @module services/omdb
 */

/**
 * Formato común de película en toda la app (venga de OMDB o de Mongo).
 * @typedef {Object} Movie
 * @property {string} id - imdbID (OMDB) o _id (Mongo)
 * @property {'omdb'|'mongo'} source
 * @property {string} title
 * @property {string} poster
 * @property {string} year
 * @property {string} director
 * @property {string} genre
 * @property {string} runtime
 * @property {string} [plot]
 * @property {string} [actors]
 * @property {string} [rating]
 */

/**
 * Busca películas por título en OMDB.
 * @param {string} title
 * @returns {Promise<Movie[]>} lista vacía si no hay resultados
 */
const searchByTitle = async (title) => {
  // TODO (Persona 2): GET https://www.omdbapi.com/?apikey=...&s=title y normalizar a Movie
  throw new Error('omdb.searchByTitle no implementado');
};

/**
 * Obtiene una película de OMDB por su imdbID (lo necesita también Favoritos).
 * @param {string} imdbId
 * @returns {Promise<Movie|null>}
 */
const getById = async (imdbId) => {
  // TODO (Persona 2): GET https://www.omdbapi.com/?apikey=...&i=imdbId&plot=full
  throw new Error('omdb.getById no implementado');
};

module.exports = { searchByTitle, getById };
