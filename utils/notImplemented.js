/**
 * Respuesta provisional para endpoints de API aún sin hacer (501).
 * Borra su uso cuando implementes el endpoint.
 * @param {string} name - nombre del endpoint, para el mensaje
 * @param {string} name - Nombre del endpoint, para el mensaje.
 * @returns {import('express').RequestHandler} middleware que responde 501 con un mensaje
 **/
const notImplemented = (name) => (req, res) =>
  res.status(501).json({ msg: `${name}: pendiente de implementar` });

module.exports = notImplemented;
