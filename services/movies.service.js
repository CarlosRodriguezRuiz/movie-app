/**
 * Búsqueda unificada OMDB -> MongoDB. Responsable: Persona 2 (Búsqueda).
 * Regla del enunciado: 1) OMDB; 2) si no hay nada, MongoDB; 3) si tampoco, lista vacía.
 * Nunca se guardan en BBDD los datos que vienen de OMDB.
 * @module services/movies
 */
const mongoose = require('mongoose');
const omdbService = require('./omdb.service');
const Movie = require('../models/movie.model');

/**
 * Escapa los caracteres especiales de regex del texto del usuario,
 * para que "Mission: Impossible (1996)" se busque literalmente.
 * @param {string} text - Texto escrito por el usuario
 * @returns {string} El texto con los caracteres especiales escapados
 */
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Busca películas por título: primero en OMDB y, si no hay nada, en MongoDB.
 * Si OMDB falla (red, API key...), el error se propaga: no se oculta cayendo a Mongo.
 * @param {string} title - Título (o parte del título) a buscar
 * @returns {Promise<import('./omdb.service').Movie[]>} lista vacía si no hay resultados
 */
const search = async (title) => {
  if (typeof title !== 'string' || title.trim() === '') return [];
  const text = title.trim();

  // 1º OMDB: si hay resultados se devuelven tal cual y NO se guardan.
  const omdbMovies = await omdbService.searchByTitle(text);
  if (omdbMovies.length > 0) return omdbMovies;

  // 2º MongoDB: por título, sin distinguir mayúsculas.
  const mongoMovies = await Movie.find({
    title: { $regex: escapeRegex(text), $options: 'i' },
  });

  // 3º Si tampoco hay nada, queda [].
  return mongoMovies.map((movie) => movie.toMovie());
};

/**
 * Devuelve una película por id y origen. Lo usan la vista detalle y Favoritos (Persona 3).
 * @param {string} id - imdbID (OMDB) o _id de MongoDB
 * @param {'omdb'|'mongo'} source - Origen de la película
 * @returns {Promise<import('./omdb.service').Movie|null>} null si no existe
 * @throws {Error} si source no es 'omdb' ni 'mongo' (error de programación, no "no encontrada")
 */
const getById = async (id, source) => {
  if (source === 'omdb') return omdbService.getById(id);

  if (source === 'mongo') {
    // Un id con formato inválido haría que Mongoose lance CastError: aquí es "no existe".
    if (!mongoose.isObjectIdOrHexString(id)) return null;
    const movie = await Movie.findById(id);
    return movie ? movie.toMovie() : null;
  }

  throw new Error(`Origen de película no válido: "${source}" (usa 'omdb' o 'mongo')`);
};

module.exports = { search, getById };