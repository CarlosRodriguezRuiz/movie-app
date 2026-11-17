/**
 * Manejo de rutas inexistentes y errores.
 * En Express 5 los errores de funciones async llegan aquí solos (no hace falta try/catch para next(err)).
 * @module middlewares/error
 */

/** 404: ninguna ruta ha respondido. */
const notFound = (req, res) => {
  if (req.originalUrl.startsWith('/api')) return res.status(404).json({ msg: 'Ruta no encontrada' });
  return res.status(404).render('error', { title: '404', message: 'Página no encontrada' });
};

/** Manejador de errores general (4 parámetros: así Express sabe que es de errores). */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  if (process.env.NODE_ENV !== 'test') console.error(err);
  if (req.originalUrl.startsWith('/api')) return res.status(status).json({ msg: err.message });
  return res.status(status).render('error', { title: status, message: err.message });
};

module.exports = { notFound, errorHandler };
