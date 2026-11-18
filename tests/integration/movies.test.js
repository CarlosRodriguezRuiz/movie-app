jest.mock('../../services/adminMovies.service');
jest.mock('../../models/favorite.model');
const request = require('supertest');
const adminMovies = require('../../services/movies.service');
const Favorite = require('../../models/favorite.model');
const app = require('../../app');
const { userCookie, adminCookie } = require('../helpers');

const valid = {
  title: 'Peli Inventada',
  poster: 'https://placehold.co/300x450',
  year: '2024',
  director: 'Ana',
  genre: 'Comedia',
  runtime: '90 min',
};
const saved = { ...valid, id: '65f0c0ffee0000000000abcd', source: 'mongo' };

beforeEach(() => jest.resetAllMocks());

describe('GET /movies (admin)', () => {
  test('lista las películas de MongoDB con Editar y Eliminar', async () => {
    adminMovies.getAll.mockResolvedValue([saved]);
    const res = await request(app).get('/movies').set('Cookie', adminCookie());
    expect(res.status).toBe(200);
    for (const t of ['Peli Inventada', 'Crear nueva', 'Editar', 'Eliminar']) expect(res.text).toContain(t);
  });

  test('un usuario normal vuelve a su dashboard', async () => {
    const res = await request(app).get('/movies').set('Cookie', userCookie());
    expect(res.headers.location).toBe('/dashboard');
  });
});

describe('POST /api/movie', () => {
  test('crea la película → 201', async () => {
    adminMovies.create.mockResolvedValue(saved);
    const res = await request(app).post('/api/movie').set('Cookie', adminCookie()).send(valid);
    expect(res.status).toBe(201);
    expect(res.body.source).toBe('mongo');
  });

  test.each([
    ['sin título', { ...valid, title: '' }],
    ['imagen que no es URL', { ...valid, poster: 'foto.jpg' }],
    ['año mal', { ...valid, year: '20' }],
    ['sin director', { ...valid, director: '' }],
    ['rating fuera de rango', { ...valid, rating: '11' }],
  ])('%s → 400', async (_, body) => {
    const res = await request(app).post('/api/movie').set('Cookie', adminCookie()).send(body);
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
    expect(adminMovies.create).not.toHaveBeenCalled();
  });

  test('un usuario normal → 403', async () => {
    const res = await request(app).post('/api/movie').set('Cookie', userCookie()).send(valid);
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/movie/:id', () => {
  test('edita → 200', async () => {
    adminMovies.update.mockResolvedValue({ ...saved, title: 'Otro título' });
    const res = await request(app).put(`/api/movie/${saved.id}`).set('Cookie', adminCookie()).send({ ...valid, title: 'Otro título' });
    expect(res.body.title).toBe('Otro título');
  });

  test('aplica la misma validación que al crear', async () => {
    const res = await request(app).put(`/api/movie/${saved.id}`).set('Cookie', adminCookie()).send({ ...valid, year: 'abc' });
    expect(res.status).toBe(400);
  });

  test('id que no existe → 404', async () => {
    adminMovies.update.mockResolvedValue(null);
    const res = await request(app).put('/api/movie/nope').set('Cookie', adminCookie()).send(valid);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/movie/:id', () => {
  test('borra la película y sus favoritos', async () => {
    adminMovies.remove.mockResolvedValue(true);
    Favorite.removeByMovie.mockResolvedValue(3);
    const res = await request(app).delete(`/api/movie/${saved.id}`).set('Cookie', adminCookie());
    expect(res.status).toBe(200);
    expect(Favorite.removeByMovie).toHaveBeenCalledWith(saved.id, 'mongo');
    expect(res.body.favoritesRemoved).toBe(3);
  });

  test('id que no existe → 404 y no toca los favoritos', async () => {
    adminMovies.remove.mockResolvedValue(false);
    const res = await request(app).delete('/api/movie/nope').set('Cookie', adminCookie());
    expect(res.status).toBe(404);
    expect(Favorite.removeByMovie).not.toHaveBeenCalled();
  });
});