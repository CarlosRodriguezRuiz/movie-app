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
 *     description: Solo rol user. Busca primero en OMDB (sin guardar nada) y, si no hay resultados, en las películas creadas por el admin (MongoDB).
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema: { type: string }
 *         description: Título (o parte del título) a buscar
 *     responses:
 *       200:
 *         description: Lista de películas (vacía si no hay resultados)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Movie' }
 *       401: { description: No autenticado }
 *       403: { description: Solo el rol user puede buscar }
 *       500: { description: Error al consultar OMDB o MongoDB }
 */
router.get('/api/movie/:title', verifyToken, requireRole('user'), search.searchApi);

module.exports = router;