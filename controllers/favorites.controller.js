/**
 * Favoritos del usuario (relación en SQL). Responsable: Persona 3.
 * @module controllers/favorites
 */
const notImplemented = require('../utils/notImplemented');

// ---- Vistas ----
/** GET /favorites (user): "Mis películas" con botón "Quitar de Mis películas" */
const favoritesView = (req, res) => res.render('favorites', { title: 'Mis películas', movies: [] });

// ---- API ----
const getFavorites = notImplemented('GET /api/favorites');
const addFavorite = notImplemented('POST /api/favorites');
const removeFavorite = notImplemented('DELETE /api/favorites');

module.exports = { favoritesView, getFavorites, addFavorite, removeFavorite };
