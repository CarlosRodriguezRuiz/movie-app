/**
 * Gestión de películas del Administrador (MongoDB). Responsable: Persona 3.
 * - VISTA: GET /movies → pinta el panel (render).
 * - API:   /api/movie → crea, edita y borra. Responde SIEMPRE en JSON.
 * Los errores inesperados los recoge errorHandler (Express 5 los reenvía solo).
 * @module controllers/movies
 */
const { isObjectIdOrHexString } = require('mongoose');
const Movie = require('../models/movie.model');
const Favorite = require('../models/favorite.model');

// ---- VISTA ----

/**
 * GET /movies: listado del admin con "Crear nueva", "Editar" y "Eliminar".
 */
const adminMoviesView = async (req, res) => {
  const docs = await Movie.find().sort({ createdAt: -1 });
  const movies = docs.map((doc) => doc.toMovie());
  return res.render('admin-movies', { title: 'Gestionar películas', movies });
};

// ---- API (JSON) ----

/**
 * POST /api/movie: crea la película y la devuelve.
 * Los datos ya llegan validados por las rutas (express-validator).
 */
const createMovie = async (req, res) => {
  const doc = await Movie.create(req.body);
  return res.status(201).json(doc.toMovie());
};

/**
 * PUT /api/movie/:id: edita la película y la devuelve ya cambiada.
 */
const updateMovie = async (req, res) => {
  const { id } = req.params;
  if (!isObjectIdOrHexString(id)) {
    return res.status(404).json({ error: 'Película no encontrada' });
  }
  const doc = await Movie.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!doc) {
    return res.status(404).json({ error: 'Película no encontrada' });
  }
  return res.json(doc.toMovie());
};

/**
 * DELETE /api/movie/:id: borra la película y después sus favoritos (PostgreSQL).
 */
const deleteMovie = async (req, res) => {
  const { id } = req.params;
  if (!isObjectIdOrHexString(id)) {
    return res.status(404).json({ error: 'Película no encontrada' });
  }
  const doc = await Movie.findByIdAndDelete(id);
  if (!doc) {
    return res.status(404).json({ error: 'Película no encontrada' });
  }
  // Si nadie la tenía en favoritos, no pasa nada
  await Favorite.removeByMovie(id, 'mongo');
  return res.json({ message: 'Película borrada', id });
};

module.exports = { adminMoviesView, createMovie, updateMovie, deleteMovie };
