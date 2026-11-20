/**
 * Middlewares de control de acceso.
 * El token JWT viaja en una cookie httpOnly llamada "token".
 * @module middlewares/auth
 */
const jwt = require('jsonwebtoken');

/**
 * ¿La petición es a la API (responde JSON) o a una vista (redirige)?
 * @param {import('express').Request} req
 * @returns {boolean} true si la URL empieza por /api
 */
const isApiRequest = (req) => req.originalUrl.startsWith('/api');

/**
 * Comprueba que hay sesión abierta (JWT válido en la cookie "token").
 * Si es válido, deja los datos del usuario en req.user y res.locals.user (para las vistas Pug).
 * Si no: vistas -> redirige a "/", API -> 401.
 * @type {import('express').RequestHandler}
 */
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  try {
    if (!token) throw new Error('Sin token');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, name, role }
    res.locals.user = payload;
    return next();
  } catch {
    res.clearCookie('token');
    if (isApiRequest(req)) return res.status(401).json({ msg: 'No autenticado' });
    return res.redirect('/');
  }
};

/**
 * Limita el acceso a uno o varios roles. Se usa SIEMPRE después de verifyToken.
 * @param {...('user'|'admin')} roles - Roles permitidos.
 * @returns {import('express').RequestHandler}
 * @example
 * router.get('/movies', verifyToken, requireRole('admin'), controller.adminMovies);
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    // ¿Tiene uno de los roles permitidos?
    if (req.user && roles.includes(req.user.role)) {
      return next();
    }
    // No tiene permiso. Si es la API, respondemos JSON
    if (isApiRequest(req)) {
      return res.status(403).json({ msg: 'Acceso no permitido' });
    }
    // Si es una página, lo mandamos a su zona
    if (req.user?.role === 'admin') {
      return res.redirect('/movies');
    }
    return res.redirect('/dashboard');
  };
};

/**
 * Genera el JWT de un usuario. Úsalo en login, signup y callback de OAuth.
 * @param {{id:number, email:string, name:string, role:string}} user
 * @returns {string} token firmado
 */
const signToken = ({ id, email, name, role }) =>
  jwt.sign({ id, email, name, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

module.exports = { verifyToken, requireRole, signToken };
