/**
 * ============================================================
 *  TESTS DE FAVORITOS
 * ============================================================
 * ¿POR QUÉ EN tests/integration/?
 *   "Integración" = probamos la petición COMPLETA, como si fuera el navegador:
 *   URL -> rutas (login, rol, validación) -> controlador -> respuesta.
 *   Lo que NO probamos es la BBDD ni OMDB de verdad: los sustituimos
 *   por versiones "de mentira" (mocks) para que los tests no dependan
 *   de tener PostgreSQL encendido ni internet.
 */

// Modelo de favoritos "de mentira": cada función es un jest.fn() que
// en cada test le decimos qué devolver (mockResolvedValue).
jest.mock('../../models/favorite.model', () => ({
  getByUser: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
  removeByMovie: jest.fn(),
}));
// Servicio de películas "de mentira" (así no llamamos a OMDB).
jest.mock('../../services/movies.service', () => ({
  search: jest.fn(),
  getById: jest.fn(),
}));

const request = require('supertest');
const Favorite = require('../../models/favorite.model');
const moviesService = require('../../services/movies.service');
const { signToken } = require('../../middlewares/auth.middleware');
const app = require('../../app');

// Cookies de sesión de prueba: un user (id 1) y un admin.
const userCookie = `token=${signToken({ id: 1, name: 'Ana', email: 'ana@test.com', role: 'user' })}`;
const adminCookie = `token=${signToken({ id: 2, name: 'Admin', email: 'admin@test.com', role: 'admin' })}`;

// Una película de ejemplo, en el formato común de la app.
const inception = {
  id: 'tt1375666',
  source: 'omdb',
  title: 'Inception',
  poster: 'https://placehold.co/300x450',
  year: '2010',
  director: 'Christopher Nolan',
  genre: 'Sci-Fi',
  runtime: '148 min',
};
const body = { movieId: 'tt1375666', source: 'omdb' };

// Antes de cada test, se "olvida" lo que devolvían los mocks en el anterior.
beforeEach(() => {
  jest.resetAllMocks();
});

describe('GET /favorites (vista)', () => {
  test('muestra las películas favoritas con el botón Quitar', async () => {
    Favorite.getByUser.mockResolvedValue([{ movie_id: 'tt1375666', source: 'omdb' }]);
    moviesService.getById.mockResolvedValue(inception);

    const res = await request(app).get('/favorites').set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(res.text).toContain('Inception');
    expect(res.text).toContain('Quitar de Mis películas');
    expect(Favorite.getByUser).toHaveBeenCalledWith(1); // el id del token
  });

  test('sin favoritos muestra el mensaje de lista vacía', async () => {
    Favorite.getByUser.mockResolvedValue([]);

    const res = await request(app).get('/favorites').set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(res.text).toContain('Todavía no has añadido películas');
  });
});

describe('GET /api/favorites', () => {
  test('devuelve la lista en JSON y salta las películas que ya no existen', async () => {
    Favorite.getByUser.mockResolvedValue([
      { movie_id: 'tt1375666', source: 'omdb' },
      { movie_id: '65f0c0ffee0000000000abcd', source: 'mongo' }, // borrada por el admin
    ]);
    moviesService.getById.mockResolvedValueOnce(inception).mockResolvedValueOnce(null);

    const res = await request(app).get('/api/favorites').set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([inception]);
  });

  test('un admin no puede usar favoritos → 403', async () => {
    const res = await request(app).get('/api/favorites').set('Cookie', adminCookie);
    expect(res.status).toBe(403);
  });
});

describe('POST /api/favorites', () => {
  test('añade la película → 201', async () => {
    moviesService.getById.mockResolvedValue(inception);
    Favorite.add.mockResolvedValue({ id: 1, movie_id: 'tt1375666', source: 'omdb' });

    const res = await request(app).post('/api/favorites').set('Cookie', userCookie).send(body);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Inception');
    expect(Favorite.add).toHaveBeenCalledWith(1, 'tt1375666', 'omdb');
  });

  test('si ya la tenía → 409', async () => {
    moviesService.getById.mockResolvedValue(inception);
    Favorite.add.mockResolvedValue(null);

    const res = await request(app).post('/api/favorites').set('Cookie', userCookie).send(body);

    expect(res.status).toBe(409);
  });

  test('si la película no existe → 404 y no se guarda nada', async () => {
    moviesService.getById.mockResolvedValue(null);

    const res = await request(app).post('/api/favorites').set('Cookie', userCookie).send(body);

    expect(res.status).toBe(404);
    expect(Favorite.add).not.toHaveBeenCalled();
  });

  test.each([
    [{ source: 'omdb' }, 'falta movieId'],
    [{ movieId: 'tt1375666', source: 'netflix' }, 'source no válido'],
  ])('datos no válidos (%o, %s) → 400', async (data) => {
    const res = await request(app).post('/api/favorites').set('Cookie', userCookie).send(data);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('sin sesión → 401', async () => {
    const res = await request(app).post('/api/favorites').send(body);
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/favorites', () => {
  test('quita la película → 200', async () => {
    Favorite.remove.mockResolvedValue(1);

    const res = await request(app).delete('/api/favorites').set('Cookie', userCookie).send(body);

    expect(res.status).toBe(200);
    expect(Favorite.remove).toHaveBeenCalledWith(1, 'tt1375666', 'omdb');
  });

  test('si no la tenía → 404', async () => {
    Favorite.remove.mockResolvedValue(0);

    const res = await request(app).delete('/api/favorites').set('Cookie', userCookie).send(body);

    expect(res.status).toBe(404);
  });
});
