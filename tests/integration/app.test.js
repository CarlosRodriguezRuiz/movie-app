const request = require('supertest');
const app = require('../../app');
const { signToken } = require('../../middlewares/auth.middleware');

const userCookie = `token=${signToken({ id: 1, name: 'Ana', email: 'ana@test.com', role: 'user' })}`;
const adminCookie = `token=${signToken({ id: 2, name: 'Admin', email: 'admin@test.com', role: 'admin' })}`;

describe('Vistas públicas', () => {
  test.each(['/', '/login', '/signup'])('GET %s responde 200 con HTML', async (url) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(200);
    expect(res.type).toMatch(/html/);
  });

  test('GET /api-docs sirve Swagger', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
  });
});

describe('Control de acceso', () => {
  test.each(['/dashboard', '/search', '/favorites', '/movies', '/users', '/profile'])(
    'GET %s sin sesión redirige a /',
    async (url) => {
      const res = await request(app).get(url);
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/');
    }
  );

  test('un usuario logueado ve /dashboard', async () => {
    const res = await request(app).get('/dashboard').set('Cookie', userCookie);
    expect(res.status).toBe(200);
  });

  test('un usuario no puede entrar en /movies (admin)', async () => {
    const res = await request(app).get('/movies').set('Cookie', userCookie);
    expect(res.headers.location).toBe('/dashboard');
  });

  test('un admin no puede entrar en /search (usuario)', async () => {
    const res = await request(app).get('/search').set('Cookie', adminCookie);
    expect(res.headers.location).toBe('/movies');
  });

  test('la API sin sesión responde 401 en JSON', async () => {
    const res = await request(app).get('/api/favorites');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('msg');
  });
});

describe('Errores', () => {
  test('ruta inexistente responde 404', async () => {
    const res = await request(app).get('/no-existe');
    expect(res.status).toBe(404);
  });
});
