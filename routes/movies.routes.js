/**
 * Rutas de gestión de películas (admin, MongoDB). Responsable: Persona 3.
 */
const router = require('express').Router();
const { body } = require('express-validator');
const movies = require('../controllers/movies.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');

const adminOnly = [verifyToken, requireRole('admin')];

// Reglas de una película (las mismas para crear y para editar)
const movieRules = [
  body('title').trim().notEmpty().withMessage('El título es obligatorio'),
  body('poster').trim().isURL().withMessage('La imagen tiene que ser una URL'),
  body('year').trim().matches(/^\d{4}$/).withMessage('El año tiene que tener 4 cifras'),
  body('director').trim().notEmpty().withMessage('El director es obligatorio'),
  body('genre').trim().notEmpty().withMessage('El género es obligatorio'),
  body('runtime').trim().notEmpty().withMessage('La duración es obligatoria'),
  validate,
];

/**
 * @openapi
 * components:
 *   schemas:
 *     MovieInput:
 *       type: object
 *       required: [title, poster, year, director, genre, runtime]
 *       properties:
 *         title:    { type: string, example: Peli Inventada }
 *         poster:   { type: string, format: uri, example: 'https://ejemplo.com/poster.jpg' }
 *         year:     { type: string, example: '2024' }
 *         director: { type: string, example: Ana Pérez }
 *         genre:    { type: string, example: Comedia }
 *         runtime:  { type: string, example: 95 min }
 *         plot:     { type: string }
 *         actors:   { type: string }
 *         rating:   { type: string, example: '7.5' }
 */

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MovieInput' }
 *     responses:
 *       201: { description: Película creada (la devuelve en JSON) }
 *       400: { description: Datos no válidos (lista de errores) }
 *       401: { description: Sin sesión }
 *       403: { description: No eres admin }
 */
router.post('/api/movie', adminOnly, movieRules, movies.createMovie);

/**
 * @openapi
 * /api/movie/{id}:
 *   put:
 *     tags: [Movies]
 *     summary: Editar película (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MovieInput' }
 *     responses:
 *       200: { description: Película actualizada (la devuelve en JSON) }
 *       400: { description: Datos no válidos }
 *       404: { description: No existe }
 *   delete:
 *     tags: [Movies]
 *     summary: Borrar película y sus favoritos asociados (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Película borrada }
 *       404: { description: No existe }
 */
router.put('/api/movie/:id', adminOnly, movieRules, movies.updateMovie);
router.delete('/api/movie/:id', adminOnly, movies.deleteMovie);

module.exports = router;
