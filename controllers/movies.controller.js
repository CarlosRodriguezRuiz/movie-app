/**
 * Gestión de películas del Administrador (MongoDB). Responsable: Persona 3.
 * @module controllers/movies
 */
const notImplemented = require('../utils/notImplemented');

// ---- Vistas ----
/** GET /movies (admin): botón "Crear nueva" + listado con Editar / Eliminar */
const adminMoviesView = (req, res) => res.render('admin-movies', { title: 'Gestionar películas', movies: [] });

// ---- API ----
const createMovie = notImplemented('POST /api/movie');
const updateMovie = notImplemented('PUT /api/movie/:id');
// Recuerda: al borrar, eliminar también sus favoritos (favorite.model.removeByMovie)
const deleteMovie = notImplemented('DELETE /api/movie/:id');

module.exports = { adminMoviesView, createMovie, updateMovie, deleteMovie };
