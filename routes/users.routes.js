/**
 * Rutas de perfil, dashboard y usuarios. Responsable: Persona 1.
 */
const router = require('express').Router();
const { body } = require('express-validator');
const users = require('../controllers/users.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');

/** Reglas para editar el perfil: si alguna falla, validate responde 400 con los errores */
const profileRules = [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').trim().toLowerCase().isEmail().withMessage('El email no es válido'),
  validate,
];

// ---- Vistas ----
router.get('/dashboard', verifyToken, requireRole('user'), users.dashboardView);
router.get('/profile', verifyToken, users.profileView);
router.get('/users', verifyToken, requireRole('admin'), users.usersView);

// ---- API ----
/**
 * @openapi
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:       { type: integer, example: 1 }
 *         name:     { type: string, example: Usuario Prueba }
 *         email:    { type: string, format: email, example: user@test.com }
 *         role:     { type: string, enum: [user, admin] }
 *         provider: { type: string, enum: [local, google] }
 * /api/user:
 *   get:
 *     tags: [Users]
 *     summary: Datos del perfil del usuario logueado
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Datos del usuario (sin contraseña)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/UserProfile' }
 *       401: { description: No autenticado }
 *   put:
 *     tags: [Users]
 *     summary: Editar mi perfil (nombre y email)
 *     description: >
 *       Cambia el nombre y el email del usuario logueado y renueva la cookie "token".
 *       Si entró con Google, el email no se cambia.
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:  { type: string, example: Ana López }
 *               email: { type: string, format: email, example: ana@test.com }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/UserProfile' }
 *       400: { description: Nombre vacío o email no válido }
 *       401: { description: No autenticado }
 *       409: { description: Ese email ya es de otro usuario }
 *   delete:
 *     tags: [Users]
 *     summary: Borrar un usuario (admin)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Usuario borrado }
 *       403: { description: Solo admin }
 */
router.get('/api/user', verifyToken, users.getUser);
router.put('/api/user', verifyToken, profileRules, users.updateUser);
router.delete('/api/user', verifyToken, requireRole('admin'), users.deleteUser);

module.exports = router;
