/**
 * Autenticación. Responsable: Persona 1.
 * @module controllers/auth
 */
const notImplemented = require('../utils/notImplemented');

// ---- Vistas ----
/** GET / y GET /login: formulario de login (+ botón de Google) */
const loginView = (req, res) => res.render('login', { title: 'Entrar' });

/** GET /signup: formulario de registro (+ botón de Google) */
const signupView = (req, res) => res.render('signup', { title: 'Registro' });

// ---- API ----
// TODO: validar, hashear con bcrypt, insertar en SQL, signToken(), cookie httpOnly "token", redirect /dashboard
const signup = notImplemented('POST /api/signup');
// TODO: comprobar credenciales, signToken(), cookie; redirect /dashboard (user) o /movies (admin)
const login = notImplemented('POST /api/login');

/** POST /api/logout: borra la cookie y vuelve al inicio */
const logout = (req, res) => {
  res.clearCookie('token');
  return res.redirect('/');
};

module.exports = { loginView, signupView, signup, login, logout };
