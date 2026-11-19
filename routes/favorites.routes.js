/**
 * Rutas de favoritos. Responsable: Persona 3.
 */
const router = require('express').Router();
const fav = require('../controllers/favorites.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { body } = require('express-validator');

const userOnly = [verifyToken, requireRole('user')];
// Reglas de los datos. Añadir y quitar reciben lo mismo: { movieId, source }.
const favoriteRules = [
  // trim() quita espacios; notEmpty() exige que haya algo.
  body('movieId').trim().notEmpty().withMessage('Falta la película (movieId)'),
  // isIn: solo se aceptan estos dos valores (igual que el CHECK de la tabla).
  body('source').isIn(['omdb', 'mongo']).withMessage('source tiene que ser omdb o mongo'),
  // Siempre al final: mira si alguna regla ha fallado y, si es así, responde 400.
  validate,
];
// ---- Vistas ----
router.get('/favorites', userOnly, fav.favoritesView);

// ---- API ----

/**
 * @openapi
 * components:
 *   schemas:
 *     FavoriteInput:
 *       type: object
 *       required: [movieId, source]
 *       properties:
 *         movieId:
 *           type: string
 *           description: imdbID (OMDB) o _id (Mongo)
 *           example: tt1375666
 *         source:
 *           type: string
 *           enum: [omdb, mongo]
 *           example: omdb
 * /api/favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: Favoritos del usuario logueado
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de películas favoritas (vacía si no tiene)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Movie' }
 *       401: { description: No autenticado }
 *       403: { description: Solo para usuarios (no admin) }
 *   post:
 *     tags: [Favorites]
 *     summary: Añadir a favoritos (solo se guarda movieId + source)
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/FavoriteInput' }
 *     responses:
 *       201: { description: Añadida. Devuelve la película }
 *       400: { description: Datos no válidos }
 *       401: { description: No autenticado }
 *       404: { description: La película no existe }
 *       409: { description: Ya estaba en favoritos }
 *   delete:
 *     tags: [Favorites]
 *     summary: Quitar de favoritos
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/FavoriteInput' }
 *     responses:
 *       200: { description: Quitada de favoritos }
 *       400: { description: Datos no válidos }
 *       401: { description: No autenticado }
 *       404: { description: No estaba en favoritos }
 */
// Se leen de izquierda a derecha: porteros -> reglas -> controlador.
router.get('/api/favorites', userOnly, fav.getFavorites);
router.post('/api/favorites', userOnly, favoriteRules, fav.addFavorite);
router.delete('/api/favorites', userOnly, favoriteRules, fav.removeFavorite);

module.exports = router;
