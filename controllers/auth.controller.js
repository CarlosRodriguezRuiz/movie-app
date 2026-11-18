/**
 * Autenticación. Responsable: Persona 1.
 * @module controllers/auth
 */

const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { signToken } = require('../middlewares/auth.middleware');

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

/**
 * POST /api/login: comprueba email y contraseña, abre sesión y redirige según el rol.
 */
const login = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;

  // Si algo falla, volvemos al login con el mismo mensaje siempre
  // (no decimos si lo que falla es el email o la contraseña)
  const fail = () => {
    return res.status(401).render('login', {
      title: 'Entrar',
      error: 'Email o contraseña incorrectos',
      form: { email },
    });
  };
  if (!email || !password) {
    return fail();
  }
  const user = await User.getByEmail(email);
  if (!user) {
    return fail();
  }
  //Si se registró con Google no tiene contraseña: no puede entrar por aquí
  if (!user.password) {
    return fail();
  }
  //Comparar la contraseña escrita con la cifrada que hay en la BBDD
  const passwordOk = await bcrypt.compare(password, user.password);
  if (!passwordOk) {
    return fail();
  }
  // 5. Abrir sesión: el JWT va en una cookie httpOnly (igual que en el registro)
  res.cookie('token', signToken(user), { httpOnly: true });
  // 6. Cada uno a su sitio según el rol
  if (user.role === 'admin') {
    return res.redirect('/movies');
  }
  return res.redirect('/dashboard');
};

/** POST /api/logout: borra la cookie y vuelve al inicio */
const logout = (req, res) => {
  res.clearCookie('token');// borra la cookie donde va el JWT
  return res.redirect('/'); // vuelve al login
};

module.exports = { loginView, signupView, signup, login, logout };
