/**
 * Perfil, dashboard y gestión de usuarios. Responsable: Persona 1.
 * @module controllers/users
 */
const notImplemented = require('../utils/notImplemented');
const User = require('../models/user.model');
const { signToken } = require('../middlewares/auth.middleware');

// ---- Vistas ----
/** GET /dashboard (user): dos botones -> /search y /favorites */
const dashboardView = (req, res) => res.render('dashboard', { title: 'Panel de control', showMenu: false });

/**
 * GET /profile (user y admin): mis datos en un formulario para editarlos.
 * Se leen de la BBDD (no del token) para enseñar siempre lo último guardado.
 */
const profileView = async (req, res) => {
  const profile = await User.getById(req.user.id);
  if (!profile) {
    // El token es de un usuario que ya no existe: cerramos sesión
    res.clearCookie('token');
    return res.redirect('/');
  }
  return res.render('profile', { title: 'Mi perfil', profile });
};

/** GET /users (admin): CRUD de usuarios */
const usersView = (req, res) => res.render('users', { title: 'Usuarios', users: [] });

// ---- API ----

/** GET /api/user: datos del usuario logueado (sin contraseña) */
const getUser = async (req, res) => {
  const user = await User.getById(req.user.id);
  if (!user) {
    return res.status(404).json({ msg: 'Usuario no encontrado' });
  }
  return res.json(user);
};

/**
 * PUT /api/user: edita el nombre y el email del usuario logueado.
 * Los datos ya llegan validados por las rutas (express-validator).
 */
const updateUser = async (req, res) => {
  const current = await User.getById(req.user.id);
  if (!current) {
    return res.status(404).json({ msg: 'Usuario no encontrado' });
  }

  const { name } = req.body;
  let { email } = req.body;

  // Si entra con Google, el email lo pone Google: no se puede cambiar
  if (current.provider === 'google') {
    email = current.email;
  }

  // El email no puede ser de OTRO usuario
  const other = await User.getByEmail(email);
  if (other && other.id !== current.id) {
    return res.status(409).json({ errors: [{ msg: 'Ese email ya está registrado' }] });
  }

  const user = await User.update(current.id, name, email);

  // El nombre y el email van dentro del JWT: lo renovamos con los datos nuevos
  res.cookie('token', signToken(user), { httpOnly: true });
  return res.json(user);
};

const deleteUser = notImplemented('DELETE /api/user');

module.exports = { dashboardView, profileView, usersView, getUser, updateUser, deleteUser };
