/**
 * Manejo de rutas inexistentes y errores.
 * En Express 5 los errores de funciones async llegan aquí solos (no hace falta try/catch para next(err)).
 * @module middlewares/error
 */

/**
 * 404: ninguna ruta ha respondido. API -> JSON, vistas -> página de error.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {void}
 */
const notFound = (req, res) => {
  if (req.originalUrl.startsWith('/api')) return res.status(404).json({ msg: 'Ruta no encontrada' });
  return res.status(404).render('error', { title: '404', message: 'Página no encontrada' });
};

/**
 * Manejador de errores general (4 parámetros: así Express sabe que es de errores).
 * @param {Error & {status?: number}} err - Error recibido (status opcional, 500 por defecto).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next - No se usa, pero Express lo necesita.
 * @returns {void}
 */
  const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  if (process.env.NODE_ENV !== 'test') console.error(err);
  if (req.originalUrl.startsWith('/api')) return res.status(status).json({ msg: err.message });
  return res.status(status).render('error', { title: status, message: err.message });
};

module.exports = { notFound, errorHandler };
