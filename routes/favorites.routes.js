/**
 * Rutas de favoritos. Responsable: Persona 3.
 */
const router = require('express').Router();
const fav = require('../controllers/favorites.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const userOnly = [verifyToken, requireRole('user')];

// ---- Vistas ----
router.get('/favorites', userOnly, fav.favoritesView);

// ---- API ----
/**
 * @openapi
 * /api/favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: Favoritos del usuario logueado
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Lista de películas favoritas }
 *   post:
 *     tags: [Favorites]
 *     summary: Guardar favorito (solo la relación movie_id + source)
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId: { type: string }
 *               source: { type: string, enum: [omdb, mongo] }
 *     responses:
 *       201: { description: Favorito guardado }
 *   delete:
 *     tags: [Favorites]
 *     summary: Quitar favorito
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Favorito eliminado }
 */
router.get('/api/favorites', userOnly, fav.getFavorites);
router.post('/api/favorites', userOnly, fav.addFavorite);
router.delete('/api/favorites', userOnly, fav.removeFavorite);

module.exports = router;
