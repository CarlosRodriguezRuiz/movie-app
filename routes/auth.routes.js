/**
 * Rutas de autenticación. Responsable: Persona 1.
 */
const router = require('express').Router();
const auth = require('../controllers/auth.controller');

const passport = require('passport');
const { signToken } = require('../middlewares/auth.middleware');

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
 *     description: >
 *       Crea el usuario en PostgreSQL con la contraseña cifrada (bcrypt),
 *       guarda el JWT en la cookie httpOnly "token" y redirige a /dashboard.
 *       Si algo falla, vuelve a pintar el formulario de registro con el error.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *            schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ana
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ana@test.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: '123456'
 *     responses:
 *       201:
 *         description: Usuario creado. Deja la cookie "token" y redirige a /dashboard
 *       400:
 *         description: >
 *           Datos no válidos (nombre vacío, email con formato incorrecto,
 *           contraseña de menos de 6 caracteres) o el email ya está registrado.
 *           Devuelve el formulario de registro con el mensaje de error.
 */
router.post('/api/signup', auth.signup);

/**
 * @openapi
 * /api/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión con email y contraseña
 *     description: >
 *       Busca el usuario por email y compara la contraseña con bcrypt.
 *       Si es correcta, guarda el JWT en la cookie httpOnly "token"
 *       y redirige según el rol. Usuarios de prueba: user@test.com y
 *       admin@test.com (contraseña 123456).
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@test.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: '123456'
 *     responses:
 *       302:
 *         description: >
 *           Login correcto. Deja la cookie "token" y redirige a /dashboard
 *           (user) o a /movies (admin).
 *       401:
 *         description: >
 *           Email o contraseña incorrectos (o faltan datos). Devuelve el
 *           formulario de login con el mensaje de error.
 */
router.post('/api/login', auth.login);

/**
 * @openapi
 * /api/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesión
 *     description: Borra la cookie "token" (el JWT) y redirige al login.
 *     responses:
 *       302:
 *         description: Sesión cerrada. Redirige a /
 */
router.post('/api/logout', auth.logout);

// ---- OAuth con Google ----
/**
 * @openapi
 * /auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Iniciar sesión con Google
 *     description: >
 *       Redirige a la pantalla de Google para elegir una cuenta.
 *       Ábrelo en el navegador, no funciona desde "Try it out".
 *     responses:
 *       302:
 *         description: Redirige a la pantalla de login de Google
 */
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account',
  session: false,
}));

/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Vuelta de Google (callback de OAuth)
 *     description: >
 *       Google vuelve aquí con un código. Si el email no existe en la BBDD,
 *       se crea el usuario sin contraseña (provider "google"). Después guarda
 *       el JWT en la cookie httpOnly "token" y redirige según el rol.
 *       No se llama a mano: lo llama Google.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema: { type: string }
 *         description: Código que manda Google para identificar al usuario
 *     responses:
 *       302:
 *         description: >
 *           Login correcto: redirige a /dashboard (user) o /movies (admin).
 *           Si falla o el usuario cancela, redirige a /login.
 */
router.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    res.cookie('token', signToken(req.user), { httpOnly: true });
    if (req.user.role === 'admin') {
      return res.redirect('/movies');
    }
    return res.redirect('/dashboard');
  }
);
module.exports = router;
