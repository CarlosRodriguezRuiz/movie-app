
const moviesService = require('../services/movies.service');
/**
 * Búsqueda de películas. Responsable: Persona 2.
 * @module controllers/search
 */
const moviesService = require('../services/movies.service');

// ---- Vistas ----
/**
 * GET /search: buscador (?title=...) y resultados.
 * Sin título (o solo espacios) solo se pinta el buscador, sin consultar nada.
 * Si el servicio falla, el error lo recoge errorHandler (Express 5 lo reenvía solo).
 */
const searchView = async (req, res) => {
  // ?title=a&title=b llega como array: solo aceptamos texto
  const query = typeof req.query.title === 'string' ? req.query.title.trim() : '';

  if (!query) {
    return res.render('search', { title: 'Buscar', query: '', searched: false, movies: [] });
  }

  const movies = await moviesService.search(query);
  return res.render('search', { title: 'Buscar', query, searched: true, movies });
};

/** GET /search/:title: detalle de una película */
// TODO: usar movies.service y render('movie-detail', { movie })
const detailView = (req, res) => res.render('movie-detail', { title: req.params.title, movie: null });

// ---- API ----
/** GET /api/movie/:title: devuelve en JSON la lista de películas (vacía si no hay resultados). */
const searchApi = async (req, res) => {
  const movies = await moviesService.search(req.params.title);
  return res.json(movies);
};

module.exports = { searchView, detailView, searchApi };