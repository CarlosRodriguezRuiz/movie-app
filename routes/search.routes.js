/**
 * Rutas de búsqueda. Responsable: Persona 2.
 */
const router = require('express').Router();
const search = require('../controllers/search.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

// ---- Vistas ----
router.get('/search', verifyToken, requireRole('user'), search.searchView);
router.get('/search/:title', verifyToken, requireRole('user'), search.detailView);

// ---- API ----
/**
 * @openapi
 * /api/movie/{title}:
 *   get:
 *     tags: [Movies]
 *     summary: Buscar películas por título (OMDB y, si no hay, MongoDB)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de películas (vacía si no hay resultados)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Movie' }
 */
router.get('/api/movie/:title', verifyToken, search.searchApi);

module.exports = router;
