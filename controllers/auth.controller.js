/**
 * Autenticación. Responsable: Persona 1.
 * @module controllers/auth
 */

const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { signToken } = require('../middlewares/auth.middleware');

const notImplemented = require('../utils/notImplemented');

// ---- Vistas ----
/** GET / y GET /login: formulario de login (+ botón de Google) */
const loginView = (req, res) => res.render('login', { title: 'Entrar' });

/** GET /signup: formulario de registro (+ botón de Google) */
const signupView = (req, res) => res.render('signup', { title: 'Registro' });

// ---- API ----
// TODO: validar, hashear con bcrypt, insertar en SQL, signToken(), cookie httpOnly "token", redirect /dashboard

/**
 * POST /api/signup: crea el usuario, abre sesión y redirige a /dashboard.
 */
/**
 * POST /api/signup: crea el usuario, abre sesión y redirige a /dashboard.
 */
const signup = async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;
  // Si algo falla, volvemos a pintar el formulario con el error (y lo que ya había escrito)
  const fail = (error) => {
    return res.status(400).render('signup', {
      title: 'Registro',
      error,
      form: { name, email },
    });
  };
  // 1. Validar
  if (!name) {
    return fail('El nombre es obligatorio');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) {
    return fail('El email no es válido');
  }
  if (!password || password.length < 6) {
    return fail('La contraseña tiene que tener al menos 6 caracteres');
  }
  // 2. Comprobar si ya estaba con getEmail
  const existingUser = await User.getByEmail(email);
  if (existingUser) {
    return fail('Ese email ya está registrado');
  }
  // 3. Cifrar la contraseña (nunca se guarda tal cual)
  const hash = await bcrypt.hash(password, 10);
  // 4. Guardar en PostgreSQL
  const user = await User.create(name, email, hash);
  // 5. Abrir sesión: el JWT va en una cookie httpOnly
  res.cookie('token', signToken(user), { httpOnly: true });

  return res.redirect('/dashboard');
};

// TODO: comprobar credenciales, signToken(), cookie; redirect /dashboard (user) o /movies (admin)
const login = notImplemented('POST /api/login');

/** POST /api/logout: borra la cookie y vuelve al inicio */
const logout = (req, res) => {
  res.clearCookie('token');
  return res.redirect('/');
};

module.exports = { loginView, signupView, signup, login, logout };
