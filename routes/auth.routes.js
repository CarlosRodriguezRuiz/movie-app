/**
 * Rutas de autenticación. Responsable: Persona 1.
 */
const router = require('express').Router();
const auth = require('../controllers/auth.controller');

// ---- Vistas públicas ----
router.get('/', auth.loginView);
router.get('/login', auth.loginView);
router.get('/signup', auth.signupView);

// ---- API ----
/**
 * @openapi
 * /api/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar usuario, abrir sesión y redirigir a /dashboard
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       302: { description: Redirige a /dashboard }
 *       400: { description: Datos no válidos }
 */
router.post('/api/signup', auth.signup);

/**
 * @openapi
 * /api/login:
 *   post:
 *     tags: [Auth]
 *     summary: Validar credenciales y abrir sesión (JWT en cookie)
 *     responses:
 *       302: { description: Redirige a /dashboard (user) o /movies (admin) }
 *       401: { description: Credenciales incorrectas }
 */
router.post('/api/login', auth.login);

/**
 * @openapi
 * /api/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesión y redirigir a /
 *     responses:
 *       302: { description: Redirige a / }
 */
router.post('/api/logout', auth.logout);

// TODO (Persona 1): OAuth con Google (passport-google-oauth20)
// router.get('/auth/google', ...);
// router.get('/auth/google/callback', ...);

module.exports = router;
