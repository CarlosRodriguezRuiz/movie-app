/**
 * Rutas de perfil, dashboard y usuarios. Responsable: Persona 1.
 */
const router = require('express').Router();
// body() comprueba un campo del body; param() comprueba un trozo de la URL (:id).
const { body, param } = require('express-validator');
const users = require('../controllers/users.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');

/** Reglas para editar el perfil: si alguna falla, validate responde 400 con los errores */
const profileRules = [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').trim().toLowerCase().isEmail().withMessage('El email no es válido'),
  validate,
];

// Los dos porteros del panel de usuarios: logueado + rol admin.
const adminOnly = [verifyToken, requireRole('admin')];

// Datos de un usuario cuando lo crea o edita el admin.
const userRules = [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').trim().toLowerCase().isEmail().withMessage('El email no es válido'),
  body('role').isIn(['user', 'admin']).withMessage('El rol tiene que ser user o admin'),
];

// Crear: lo de arriba + contraseña (al editar no se cambia la contraseña).
const createUserRules = [
  ...userRules, // "..." mete aquí todas las reglas de userRules
  body('password').isLength({ min: 6 }).withMessage('La contraseña necesita al menos 6 caracteres'),
  validate,
];

// Editar: el id de la URL tiene que ser un número + los datos.
const editUserRules = [
  param('id').isInt().withMessage('Id no válido'),
  ...userRules,
  validate,
];

// Borrar: solo el id.
const idRules = [param('id').isInt().withMessage('Id no válido'), validate];

// ---- Vistas ----
router.get('/dashboard', verifyToken, requireRole('user'), users.dashboardView);
router.get('/profile', verifyToken, users.profileView);
router.get('/users', adminOnly, users.usersView);

// ---- API: perfil propio ----
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
 */
router.get('/api/user', verifyToken, users.getUser);
router.put('/api/user', verifyToken, profileRules, users.updateUser);

// ---- API: gestión de usuarios (solo admin) ----
/**
 * @openapi
 * components:
 *   schemas:
 *     UserInput:
 *       type: object
 *       required: [name, email, role]
 *       properties:
 *         name:     { type: string, example: Pepe }
 *         email:    { type: string, format: email, example: pepe@test.com }
 *         password: { type: string, format: password, minLength: 6, example: '123456', description: Solo al crear }
 *         role:     { type: string, enum: [user, admin], example: user }
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Crear un usuario (admin)
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UserInput' }
 *     responses:
 *       201:
 *         description: Usuario creado (sin contraseña)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/UserProfile' }
 *       400: { description: Datos no válidos }
 *       401: { description: No autenticado }
 *       403: { description: Solo admin }
 *       409: { description: El email ya está registrado }
 * /api/users/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema: { type: integer }
 *   put:
 *     tags: [Users]
 *     summary: Editar nombre, email y rol de un usuario (admin)
 *     description: Si el usuario entra con Google, su email no se cambia.
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UserInput' }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/UserProfile' }
 *       400: { description: 'Datos no válidos, o el admin intenta quitarse su propio rol' }
 *       401: { description: No autenticado }
 *       403: { description: Solo admin }
 *       404: { description: El usuario no existe }
 *       409: { description: El email ya es de otro usuario }
 *   delete:
 *     tags: [Users]
 *     summary: Borrar un usuario (admin)
 *     description: También se borran sus favoritos (ON DELETE CASCADE).
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Usuario borrado }
 *       400: { description: 'Id no válido, o el admin intenta borrarse a sí mismo' }
 *       401: { description: No autenticado }
 *       403: { description: Solo admin }
 *       404: { description: El usuario no existe }
 */
router.post('/api/users', adminOnly, createUserRules, users.createUser);
router.put('/api/users/:id', adminOnly, editUserRules, users.editUser);
router.delete('/api/users/:id', adminOnly, idRules, users.deleteUser);

module.exports = router;
