/**
 * Favoritos del usuario (relación en SQL). Responsable: Persona 3.
 * @module controllers/favorites
 */
const Favorite = require('../models/favorite.model');
const moviesService = require('../services/movies.service');
// ---- Vistas ----
/** GET /favorites (user): "Mis películas" con botón "Quitar de Mis películas" */
const favoritesView = async (req, res) => {
  const favorites = await Favorite.getByUser(req.user.id);

  const movies = await Promise.all(
    favorites.map((fav) => moviesService.getById(fav.movie_id, fav.source))
  );
  return res.render('favorites', { title: 'Mis películas', movies: movies.filter(Boolean) });
};

// ---- API ----
const getFavorites = async (req, res) => {
  // Los mismos 3 pasos que en favoritesView, pero respondiendo JSON en vez de HTML.
  const favorites = await Favorite.getByUser(req.user.id);
  const movies = await Promise.all(
    favorites.map((fav) => moviesService.getById(fav.movie_id, fav.source))
  );
  return res.json(movies.filter(Boolean)); // 200 por defecto
};

/** POST /api/favorites { movieId, source }: añadir a favoritos. */
const addFavorite = async (req, res) => {
  // Lo que manda el navegador en el body del fetch (JSON).
  // Las rutas ya han comprobado que movieId no está vacío y que source es omdb o mongo.
  const { movieId, source } = req.body;
  // 1. ¿Existe esa película de verdad? Así no guardamos ids inventados.
  const movie = await moviesService.getById(movieId, source);
  if (!movie) {
    return res.status(404).json({ msg: 'Esa película no existe' });
  }
  // 2. La guardamos. El modelo devuelve null si ya la tenía.
  const favorite = await Favorite.add(req.user.id, movieId, source);
  if (!favorite) {
    return res.status(409).json({ msg: 'Ya está en Mis películas' }); // 409 = conflicto
  }
  // 3. Todo bien: 201 = "creado". Devolvemos la película por si el front la quiere usar.
  return res.status(201).json(movie);
};

/** DELETE /api/favorites { movieId, source }: quitar de favoritos. */
const removeFavorite = async (req, res) => {
  const { movieId, source } = req.body;
  // El modelo devuelve cuántas filas ha borrado: 1 o 0.
  const deleted = await Favorite.remove(req.user.id, movieId, source);
  if (deleted === 0) {
    return res.status(404).json({ msg: 'Esa película no está en Mis películas' });
  }
  return res.json({ msg: 'Quitada de Mis películas', movieId, source }); // 200
};

module.exports = { favoritesView, getFavorites, addFavorite, removeFavorite };
