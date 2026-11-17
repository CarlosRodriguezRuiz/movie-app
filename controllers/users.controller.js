/**
 * Perfil, dashboard y gestión de usuarios. Responsable: Persona 1.
 * @module controllers/users
 */
const notImplemented = require('../utils/notImplemented');

// ---- Vistas ----
/** GET /dashboard (user): dos botones -> /search y /favorites */
const dashboardView = (req, res) => res.render('dashboard', { title: 'Panel de control', showMenu: false });

/** GET /profile (user y admin) */
const profileView = (req, res) => res.render('profile', { title: 'Mi perfil' });

/** GET /users (admin): CRUD de usuarios */
const usersView = (req, res) => res.render('users', { title: 'Usuarios', users: [] });

// ---- API ----
const getUser = notImplemented('GET /api/user');
const updateUser = notImplemented('PUT /api/user');
const deleteUser = notImplemented('DELETE /api/user');

module.exports = { dashboardView, profileView, usersView, getUser, updateUser, deleteUser };
