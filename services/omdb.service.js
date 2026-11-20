/**
 * Servicio OMDB. Responsable: Persona 2 (Búsqueda).
 * Docs de la API: http://www.omdbapi.com/
 * Node 22 trae fetch de serie, no hace falta axios.
 * @module services/omdb
 */

/**
 * Formato común de película en toda la app (venga de OMDB o de Mongo).
 * Los campos que OMDB no informa ("N/A") llegan como null.
 * @typedef {Object} Movie
 * @property {string} id - imdbID (OMDB) o _id (Mongo)
  * @property {'omdb'|'mongo'} source - Origen de la película
 * @property {string} title - Título
 * @property {string|null} poster - URL del póster
 * @property {string|null} year - Año de estreno, como texto (ej. "1999")
 * @property {string|null} director - Director o directores
 * @property {string|null} genre - Géneros separados por comas
 * @property {string|null} runtime - Duración (ej. "136 min")
 * @property {string|null} [plot] - Sinopsis
 * @property {string|null} [actors] - Actores principales
 * @property {string|null} [rating] - imdbRating como texto (ej. "8.7")
 */

const BASE_URL = 'https://www.omdbapi.com/';

/**
 * OMDB usa "N/A" cuando falta un dato: lo convertimos a null.
 * @param {*} value - Valor recibido de OMDB
 * @returns {*} El mismo valor, o null si falta (undefined, null o "N/A")
 */
const clean = (value) =>
  value === undefined || value === null || value === 'N/A' ? null : value;

/**
 * Convierte una película de OMDB (detalle completo) al formato común Movie.
 * @param {Object} omdbMovie - Respuesta de OMDB (?i=)
 * @returns {Movie} La película en el formato común
 */
const normalize = (omdbMovie) => ({
  id: omdbMovie.imdbID,
  source: 'omdb',
  title: clean(omdbMovie.Title),
  poster: clean(omdbMovie.Poster),
  year: clean(omdbMovie.Year),
  director: clean(omdbMovie.Director),
  genre: clean(omdbMovie.Genre),
  runtime: clean(omdbMovie.Runtime),
  plot: clean(omdbMovie.Plot),
  actors: clean(omdbMovie.Actors),
  rating: clean(omdbMovie.imdbRating),
});

/**
 * Hace la petición a OMDB y devuelve el JSON.
 * La API key se lee en cada llamada desde process.env.OMDB_API_KEY.
 * @param {Object} params - Parámetros de la query (s, i, plot...)
 * @returns {Promise<Object>} JSON de OMDB (trae "Response": "True" o "False")
 * @throws {Error} Si falta la API key, no es válida o la respuesta HTTP no es correcta
 */
const request = async (params) => {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) throw new Error('Falta OMDB_API_KEY en el .env');

  const url = new URL(BASE_URL);
  url.search = new URLSearchParams({ apikey: apiKey, ...params }).toString();

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OMDB respondió con estado ${res.status}`);

  const data = await res.json();
  if (data.Response === 'False' && data.Error === 'Invalid API key!') {
    throw new Error('OMDB_API_KEY no es válida');
  }
  return data;
};

/**
 * Obtiene una película de OMDB por su imdbID (lo necesita también Favoritos).
 * @param {string} imdbId - imdbID de la película (ej. "tt0133093")
 * @returns {Promise<Movie|null>} null si no existe
 */
const getById = async (imdbId) => {
  const data = await request({ i: imdbId, plot: 'full' });
  if (data.Response === 'False') return null;
  return normalize(data);
};

/**
 * Busca películas por título en OMDB.
 * ?s= no trae director, género ni duración, así que se pide el detalle
 * de cada resultado con getById.
 * @param {string} title - Título (o parte del título) a buscar
 * @returns {Promise<Movie[]>} lista vacía si no hay resultados
 */
const searchByTitle = async (title) => {
  const data = await request({ s: title });
  if (data.Response === 'False') return [];

  const movies = await Promise.all(
    data.Search.map((item) => getById(item.imdbID))
  );
  return movies.filter(Boolean);
};

module.exports = { searchByTitle, getById, normalize };