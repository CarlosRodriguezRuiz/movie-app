/**
 * Conexión a MongoDB (películas que NO están en OMDB, gestionadas por el admin).
 * @module config/db.mongo
 */
const mongoose = require('mongoose');

/**
 * Conecta con MongoDB usando MONGO_URI del .env.
 * @returns {Promise<typeof mongoose>} la instancia de mongoose ya conectada
 */
const connectMongo = () => mongoose.connect(process.env.MONGO_URI);

module.exports = { connectMongo };
