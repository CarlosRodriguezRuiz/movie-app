/**
 * Rutas de gestión de películas (admin, MongoDB). Responsable: Persona 3.
 */
const router = require('express').Router();
const movies = require('../controllers/movies.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const adminOnly = [verifyToken, requireRole('admin')];

// ---- Vistas ----
router.get('/movies', adminOnly, movies.adminMoviesView);

// ---- API ----
/**
 * @openapi
 * /api/movie:
 *   post:
 *     tags: [Movies]
 *     summary: Crear película en MongoDB (admin)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       201: { description: Película creada }
 *       400: { description: Datos no válidos }
 * /api/movie/{id}:
 *   put:
 *     tags: [Movies]
 *     summary: Editar película (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Película actualizada }
 *   delete:
 *     tags: [Movies]
 *     summary: Borrar película y sus favoritos asociados (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Película borrada }
 */
router.post('/api/movie', adminOnly, movies.createMovie);
router.put('/api/movie/:id', adminOnly, movies.updateMovie);
router.delete('/api/movie/:id', adminOnly, movies.deleteMovie);

module.exports = router;
