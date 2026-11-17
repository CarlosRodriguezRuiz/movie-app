/**
 * Rutas de perfil, dashboard y usuarios. Responsable: Persona 1.
 */
const router = require('express').Router();
const users = require('../controllers/users.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

// ---- Vistas ----
router.get('/dashboard', verifyToken, requireRole('user'), users.dashboardView);
router.get('/profile', verifyToken, users.profileView);
router.get('/users', verifyToken, requireRole('admin'), users.usersView);

// ---- API ----
/**
 * @openapi
 * /api/user:
 *   get:
 *     tags: [Users]
 *     summary: Datos del perfil del usuario logueado
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Datos del usuario }
 *       401: { description: No autenticado }
 *   put:
 *     tags: [Users]
 *     summary: Editar perfil
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Usuario actualizado }
 *   delete:
 *     tags: [Users]
 *     summary: Borrar un usuario (admin)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Usuario borrado }
 *       403: { description: Solo admin }
 */
router.get('/api/user', verifyToken, users.getUser);
router.put('/api/user', verifyToken, users.updateUser);
router.delete('/api/user', verifyToken, requireRole('admin'), users.deleteUser);

module.exports = router;
