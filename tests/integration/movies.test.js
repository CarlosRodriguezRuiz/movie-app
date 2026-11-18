/**
 * Tests del panel del admin (P3 · tarjetas 2, 3, 4 y 5).
 * Son la "lista de lo que tiene que hacer" la rama feature_admin_peliculas:
 * mientras falte código saldrán en rojo, y cuando todo esté hecho, en verde.
 */

// MongoDB "de mentira": así no hace falta tener Mongo encendido
jest.mock('../../models/movie.model', () => ({
  find: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));
// Favoritos (PostgreSQL) "de mentira"
jest.mock('../../models/favorite.model', () => ({
  removeByMovie: jest.fn(),
}));

const request = require('supertest');
const Movie = require('../../models/movie.model');
const Favorite = require('../../models/favorite.model');
const { signToken } = require('../../middlewares/auth.middleware');
const app = require('../../app');

// Cookies de sesión de prueba (igual que en tests/integration/app.test.js)
const userCookie = `token=${signToken({ id: 1, name: 'Ana', email: 'ana@test.com', role: 'user' })}`;
const adminCookie = `token=${signToken({ id: 2, name: 'Admin', email: 'admin@test.com', role: 'admin' })}`;

// Una película válida, como la mandaría el formulario
const valid = {
  title: 'Peli Inventada',
  poster: 'https://placehold.co/300x450',
  year: '2024',
  director: 'Ana',
  genre: 'Comedia',
  runtime: '90 min',
};
const id = '65f0c0ffee0000000000abcd';
// Lo que devuelve toMovie(): el formato común de película
const saved = { ...valid, id, source: 'mongo' };
// Un "documento" de Mongo de mentira: solo necesitamos su toMovie()
const doc = (movie = saved) => ({ toMovie: () => movie });

beforeEach(() => {
  jest.resetAllMocks();
});

// ---------- P3 · 2 Listado ----------
describe('GET /movies (admin)', () => {
  test('el admin ve sus películas con Crear nueva, Editar y Eliminar', async () => {
    // Movie.find().sort({ createdAt: -1 }) → lista de documentos
    Movie.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([doc()]) });

    const res = await request(app).get('/movies').set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.text).toContain('Peli Inventada');
    expect(res.text).toContain('Crear nueva');
    expect(res.text).toContain('Editar');
    expect(res.text).toContain('Eliminar');
  });

  test('un usuario normal vuelve a su dashboard', async () => {
    const res = await request(app).get('/movies').set('Cookie', userCookie);

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/dashboard');
  });
});

// ---------- P3 · 3 Crear ----------
describe('POST /api/movie', () => {
  test('datos correctos → 201 y devuelve la película', async () => {
    Movie.create.mockResolvedValue(doc());

    const res = await request(app).post('/api/movie').set('Cookie', adminCookie).send(valid);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Peli Inventada');
    expect(res.body.source).toBe('mongo');
  });

  test.each([
    ['sin título', { ...valid, title: '' }],
    ['imagen que no es una URL', { ...valid, poster: 'esto no es una url' }],
    ['año que no tiene 4 cifras', { ...valid, year: '20' }],
    ['sin director', { ...valid, director: '' }],
  ])('%s → 400 con errores y no se guarda', async (_, body) => {
    const res = await request(app).post('/api/movie').set('Cookie', adminCookie).send(body);

    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
    expect(Movie.create).not.toHaveBeenCalled();
  });

  test('un usuario normal → 403', async () => {
    const res = await request(app).post('/api/movie').set('Cookie', userCookie).send(valid);

    expect(res.status).toBe(403);
    expect(Movie.create).not.toHaveBeenCalled();
  });
});

// ---------- P3 · 4 Editar ----------
describe('PUT /api/movie/:id', () => {
  test('datos correctos → 200 y devuelve la película cambiada', async () => {
    Movie.findByIdAndUpdate.mockResolvedValue(doc({ ...saved, title: 'Otro título' }));

    const res = await request(app)
      .put(`/api/movie/${id}`)
      .set('Cookie', adminCookie)
      .send({ ...valid, title: 'Otro título' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Otro título');
  });

  test('misma validación que al crear → 400', async () => {
    const res = await request(app)
      .put(`/api/movie/${id}`)
      .set('Cookie', adminCookie)
      .send({ ...valid, year: 'abc' });

    expect(res.status).toBe(400);
    expect(Movie.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('id que no existe → 404', async () => {
    Movie.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app).put(`/api/movie/${id}`).set('Cookie', adminCookie).send(valid);

    expect(res.status).toBe(404);
  });
});

// ---------- P3 · 5 Borrar ----------
describe('DELETE /api/movie/:id', () => {
  test('borra la película y también sus favoritos', async () => {
    Movie.findByIdAndDelete.mockResolvedValue(doc());
    Favorite.removeByMovie.mockResolvedValue(3);

    const res = await request(app).delete(`/api/movie/${id}`).set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(Movie.findByIdAndDelete).toHaveBeenCalledWith(id);
    expect(Favorite.removeByMovie).toHaveBeenCalledWith(id, 'mongo');
  });

  test('id que no existe → 404 y no toca los favoritos', async () => {
    Movie.findByIdAndDelete.mockResolvedValue(null);

    const res = await request(app).delete(`/api/movie/${id}`).set('Cookie', adminCookie);

    expect(res.status).toBe(404);
    expect(Favorite.removeByMovie).not.toHaveBeenCalled();
  });

  test('un usuario normal → 403', async () => {
    const res = await request(app).delete(`/api/movie/${id}`).set('Cookie', userCookie);

    expect(res.status).toBe(403);
    expect(Movie.findByIdAndDelete).not.toHaveBeenCalled();
  });
});
