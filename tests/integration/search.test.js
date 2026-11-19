/**
 * Tests de la búsqueda (P2 · «Vista buscador y resultados»).
 * movies.service está mockeado: no se llama a OMDB ni a MongoDB.
 */
jest.mock('../../services/movies.service', () => ({
  search: jest.fn(),
  getById: jest.fn(),
}));

const request = require('supertest');
const moviesService = require('../../services/movies.service');
const { signToken } = require('../../middlewares/auth.middleware');
const app = require('../../app');

// Cookies de sesión de prueba (igual que en tests/integration/app.test.js)
const userCookie = `token=${signToken({ id: 1, name: 'Ana', email: 'ana@test.com', role: 'user' })}`;
const adminCookie = `token=${signToken({ id: 2, name: 'Admin', email: 'admin@test.com', role: 'admin' })}`;

// Películas en el formato común, una de OMDB y otra de Mongo
const omdbMovie = {
  id: 'tt0133093',
  source: 'omdb',
  title: 'The Matrix',
  poster: 'https://example.com/matrix.jpg',
  year: '1999',
  director: 'Lana Wachowski, Lilly Wachowski',
  genre: 'Action, Sci-Fi',
  runtime: '136 min',
};
const mongoMovie = {
  id: '65f0c0ffee0000000000abcd',
  source: 'mongo',
  title: 'Peli Inventada',
  poster: 'https://example.com/inventada.jpg',
  year: '2024',
  director: 'Ana',
  genre: 'Comedia',
  runtime: '90 min',
};

beforeEach(() => {
  jest.resetAllMocks();
});

// ---------- API ----------
describe('GET /api/movie/:title', () => {
  test('con sesión de usuario → 200 y un array de películas', async () => {
    moviesService.search.mockResolvedValue([omdbMovie, mongoMovie]);

    const res = await request(app).get('/api/movie/matrix').set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(res.type).toMatch(/json/);
    expect(res.body).toEqual([omdbMovie, mongoMovie]);
    expect(moviesService.search).toHaveBeenCalledWith('matrix');
  });

  test('decodifica el título de la URL (espacios y tildes)', async () => {
    moviesService.search.mockResolvedValue([]);

    await request(app).get(`/api/movie/${encodeURIComponent('El señor')}`).set('Cookie', userCookie);

    expect(moviesService.search).toHaveBeenCalledWith('El señor');
  });

  test('sin resultados → 200 y []', async () => {
    moviesService.search.mockResolvedValue([]);

    const res = await request(app).get('/api/movie/asdfghjkl').set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('sin sesión → 401 y no busca', async () => {
    const res = await request(app).get('/api/movie/matrix');

    expect(res.status).toBe(401);
    expect(moviesService.search).not.toHaveBeenCalled();
  });

  test('un admin → 403 (solo rol user) y no busca', async () => {
    const res = await request(app).get('/api/movie/matrix').set('Cookie', adminCookie);

    expect(res.status).toBe(403);
    expect(moviesService.search).not.toHaveBeenCalled();
  });

  test('si el servicio falla → error 500 en JSON, no un 200 engañoso', async () => {
    moviesService.search.mockRejectedValue(new Error('OMDB caído'));

    const res = await request(app).get('/api/movie/matrix').set('Cookie', userCookie);

    expect(res.status).toBe(500);
    expect(res.body.msg).toBe('OMDB caído');
  });
});

// ---------- Vista ----------
describe('GET /search', () => {
  test('?title=x renderiza las tarjetas con sus datos', async () => {
    moviesService.search.mockResolvedValue([omdbMovie, mongoMovie]);

    const res = await request(app).get('/search?title=x').set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(moviesService.search).toHaveBeenCalledWith('x');
    expect(res.text).toContain('The Matrix');
    expect(res.text).toContain('Peli Inventada');
    expect(res.text).toContain('1999');
    expect(res.text).toContain('Lana Wachowski, Lilly Wachowski');
    expect(res.text).toContain('Action, Sci-Fi');
    expect(res.text).toContain('136 min');
    expect(res.text).toContain('https://example.com/matrix.jpg');
  });

  test('cada tarjeta tiene "Ver detalle" y "Añadir a Favoritos" con data-id y data-source', async () => {
    moviesService.search.mockResolvedValue([omdbMovie, mongoMovie]);

    const res = await request(app).get('/search?title=x').set('Cookie', userCookie);

    expect(res.text.match(/Ver detalle/g)).toHaveLength(2);
    expect(res.text.match(/Añadir a Favoritos/g)).toHaveLength(2);
    expect(res.text).toContain('data-id="tt0133093"');
    expect(res.text).toContain('data-source="omdb"');
    expect(res.text).toContain('data-id="65f0c0ffee0000000000abcd"');
    expect(res.text).toContain('data-source="mongo"');
  });

  test('el buscador conserva lo que se escribió', async () => {
    moviesService.search.mockResolvedValue([]);

    const res = await request(app).get('/search?title=matrix').set('Cookie', userCookie);

    expect(res.text).toContain('value="matrix"');
  });

  test('sin título → solo el buscador, sin consultar el servicio', async () => {
    const res = await request(app).get('/search').set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(res.text).toContain('<form');
    expect(res.text).not.toContain('movie-card');
    expect(moviesService.search).not.toHaveBeenCalled();
  });

  test('título en blanco → solo el buscador, sin consultar el servicio', async () => {
    const res = await request(app).get('/search?title=%20%20').set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(moviesService.search).not.toHaveBeenCalled();
  });

  test('?title repetido (array) no rompe: se trata como sin búsqueda', async () => {
    const res = await request(app).get('/search?title=a&title=b').set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(moviesService.search).not.toHaveBeenCalled();
  });

  test('escapa el HTML del título buscado', async () => {
    moviesService.search.mockResolvedValue([]);
    const attack = '<script>alert(1)</script>';

    const res = await request(app)
      .get(`/search?title=${encodeURIComponent(attack)}`)
      .set('Cookie', userCookie);

    expect(res.text).not.toContain(attack);
  });

  test('si el servicio falla → página de error 500', async () => {
    moviesService.search.mockRejectedValue(new Error('OMDB caído'));

    const res = await request(app).get('/search?title=matrix').set('Cookie', userCookie);

    expect(res.status).toBe(500);
    expect(res.text).toContain('OMDB caído');
  });

  test('sin sesión redirige a /', async () => {
    const res = await request(app).get('/search?title=x');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
  });
});