/**
 * Perfil, dashboard y gestión de usuarios. Responsable: Persona 1.
 * @module controllers/users
 */
// Para guardar la contraseña cifrada (igual que en el signup).
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { signToken } = require('../middlewares/auth.middleware');

// ---- Vistas ----
/**
 * GET /dashboard (user): dos botones -> /search y /favorites.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {void}
 */
const dashboardView = (req, res) =>
  res.render('dashboard', { title: 'Panel de control', showMenu: false });

/**
 * GET /profile (user y admin): mis datos en un formulario para editarlos.
 * Se leen de la BBDD (no del token) para enseñar siempre lo último guardado.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
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

/**
 * GET /users (admin): lista de usuarios con crear, editar y borrar.
 * Pasamos también el id del admin logueado para no enseñarle "Eliminar" en sí mismo.
 */
const usersView = async (req, res) => {
  const users = await User.getAll();
  return res.render('users', { title: 'Usuarios', users, currentId: req.user.id });
};

// ---- API: perfil propio ----

/**
 * GET /api/user: datos del usuario logueado (sin contraseña).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>} 200 con el usuario o 404 si no existe
 */
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
 * @param {import('express').Request} req - body: { name, email }
 * @param {import('express').Response} res
 * @returns {Promise<void>} 200 con el usuario, 404 si no existe o 409 si el email ya es de otro
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

// ---- API: gestión de usuarios (solo admin) ----

/**
 * POST /api/users (admin): crear un usuario { name, email, password, role }.
 * Las rutas ya han validado los datos y pasado el email a minúsculas.
 */
const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // 1. ¿Ya hay alguien con ese email? (la columna es UNIQUE: mejor avisar con 409 que petar)
  const exists = await User.getByEmail(email);
  if (exists) {
    return res.status(409).json({ errors: [{ msg: 'Ese email ya está registrado' }] });
  }

  // 2. Nunca se guarda la contraseña tal cual: se cifra con bcrypt (10 = vueltas de cifrado).
  const hash = await bcrypt.hash(password, 10);

  // 3. Lo creamos como usuario "local" (con email y contraseña) y con el rol elegido.
  const user = await User.create(name, email, hash, 'local', role);
  return res.status(201).json(user); // 201 = creado
};

/**
 * PUT /api/users/:id (admin): editar nombre, email y rol de un usuario.
 */
const editUser = async (req, res) => {
  // Lo que va en la URL siempre llega como texto: lo pasamos a número.
  const id = Number(req.params.id);
  const { name, role } = req.body;
  let { email } = req.body;

  // 1. ¿Existe?
  const current = await User.getById(id);
  if (!current) {
    return res.status(404).json({ errors: [{ msg: 'Ese usuario no existe' }] });
  }

  // 2. El admin no puede quitarse a sí mismo el rol de admin (se quedaría fuera del panel).
  if (id === req.user.id && role !== 'admin') {
    return res.status(400).json({ errors: [{ msg: 'No puedes quitarte tu propio rol de admin' }] });
  }

  // 3. Si entra con Google, su email lo manda Google: no se cambia.
  if (current.provider === 'google') {
    email = current.email;
  }

  // 4. El email nuevo no puede ser de OTRA persona.
  const other = await User.getByEmail(email);
  if (other && other.id !== id) {
    return res.status(409).json({ errors: [{ msg: 'Ese email ya está registrado' }] });
  }

  const user = await User.updateByAdmin(id, name, email, role);
  return res.json(user); // 200
};

/**
 * DELETE /api/users/:id (admin): borrar un usuario (y, en cascada, sus favoritos).
 */
const deleteUser = async (req, res) => {
  const id = Number(req.params.id);

  // El admin no se puede borrar a sí mismo (perdería su sesión y quizá el único admin).
  if (id === req.user.id) {
    return res.status(400).json({ errors: [{ msg: 'No puedes borrarte a ti mismo' }] });
  }

  const deleted = await User.remove(id);
  if (deleted === 0) {
    return res.status(404).json({ errors: [{ msg: 'Ese usuario no existe' }] });
  }

  return res.json({ msg: 'Usuario borrado', id }); // 200
};

// Sin try/catch: si la BBDD falla, Express 5 manda el error solo al errorHandler.

module.exports = {
  dashboardView,
  profileView,
  usersView,
  getUser,
  updateUser,
  createUser,
  editUser,
  deleteUser,
};
