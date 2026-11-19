
const moviesService = require('../services/movies.service');
/**
 * Búsqueda de películas. Responsable: Persona 2.
 * @module controllers/search
 */
const notImplemented = require('../utils/notImplemented');

// ---- Vistas ----
/** GET /search: buscador (?title=...) y resultados */
const searchView = (req, res) => res.render('search', { title: 'Buscar', movies: [] });

/** GET /search/:title: detalle de una película */
// TODO: usar movies.service y render('movie-detail', { movie })
const detailView = (req, res) => res.render('movie-detail', { title: req.params.title, movie: null });

// ---- API ----
const searchApi = notImplemented('GET /api/movie/:title');

module.exports = { searchView, detailView, searchApi };
