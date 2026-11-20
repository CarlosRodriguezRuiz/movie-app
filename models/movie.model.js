/**
 * Modelo Mongoose de película (solo películas que NO existen en OMDB).
 * Lo mantiene el Administrador. Lo usan: búsqueda (Persona 2) y gestión admin (Persona 3).
 * ⚠️ Archivo compartido: cambiar campos = avisar al equipo.
 * @module models/movie
 */
const { Schema, model } = require('mongoose');

/**
 * Esquema de película: campos obligatorios + opcionales para la vista detalle.
 * timestamps añade createdAt y updatedAt.
 * @type {import('mongoose').Schema}
 */

const movieSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    poster: { type: String, required: true, trim: true },
    year: { type: String, required: true },
    director: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    runtime: { type: String, required: true }, // "121 min" (mismo formato que OMDB)
    // Opcionales: los muestra la vista detalle
    plot: { type: String, default: '' },
    actors: { type: String, default: '' },
    rating: { type: String, default: '' },
  },
  { timestamps: true }
);

/**
 * Convierte un documento al formato común de película (el mismo que devuelve omdb.service).
 * Así a las vistas les da igual de dónde venga la película.
 * @returns {import('../services/omdb.service').Movie}
 */
movieSchema.methods.toMovie = function toMovie() {
  const { _id, title, poster, year, director, genre, runtime, plot, actors, rating } = this;
  return { id: _id.toString(), source: 'mongo', title, poster, year, director, genre, runtime, plot, actors, rating };
};

module.exports = model('Movie', movieSchema);
