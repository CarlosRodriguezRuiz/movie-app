/**
- Gestión de películas del Administrador (MongoDB). Responsable: Persona 3.
- @module controllers/movies
 */
const Movie = require('../models/movie.model');
const Favorite = require('../models/favorite.model'); // Importar el modelo de favoritos para limpiar al borrar

// ---- Vistas / Acciones de Admin ----

/** GET /admin/movies: listado con botón "Crear nueva" + Editar / Eliminar */
const adminMoviesView = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.render('admin-movies', { title: 'Gestionar películas', movies });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error al cargar las películas');
  }
};

// Crear película
const createMovie = async (req, res) => {
  try {
    await Movie.create(req.body);
    res.redirect('/admin/movies');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error al crear la película');
  }
};

// Editar una película
const updateMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    await Movie.findByIdAndUpdate(movieId, req.body, { new: true, runValidators: true });
    res.redirect('/admin/movies');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error al actualizar la película');
  }
};

// Borrar película (incluyendo sus favoritos asociados)
const deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;

    // Eliminar también sus favoritos asociados como indicaba la nota
    if (typeof Favorite.removeByMovie === 'function') {
      await Favorite.removeByMovie(movieId);
    } else {
      await Favorite.deleteMany({ movie: movieId });
    }

    // Borrar la película
    await Movie.findByIdAndDelete(movieId);
    res.redirect('/admin/movies');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error al borrar la película');
  }
};

module.exports = { adminMoviesView, createMovie, updateMovie, deleteMovie };
