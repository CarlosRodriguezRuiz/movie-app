// El modelo de usuario es "de mentira": no se toca la base de datos
jest.mock('../../models/user.model');
const request = require('supertest');
const User = require('../../models/user.model');
const { signToken } = require('../../middlewares/auth.middleware');
const app = require('../../app');

// Cookie de sesión de un usuario normal (id 1)
const userCookie = `token=${signToken({ id: 1, name: 'Ana', email: 'ana@test.com', role: 'user' })}`;

const ana = { id: 1, name: 'Ana', email: 'ana@test.com', role: 'user', provider: 'local' };

beforeEach(() => {
  jest.resetAllMocks();
});

describe('GET /profile', () => {
  test('sin sesión → redirige al login', async () => {
    const res = await request(app).get('/profile');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
  });

  test('con sesión → enseña mis datos de la BBDD en el formulario', async () => {
    User.getById.mockResolvedValue(ana);

    const res = await request(app).get('/profile').set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(User.getById).toHaveBeenCalledWith(1);
    expect(res.text).toContain('value="Ana"');
    expect(res.text).toContain('value="ana@test.com"');
  });
});

describe('GET /api/user', () => {
  test('devuelve mis datos en JSON', async () => {
    User.getById.mockResolvedValue(ana);

    const res = await request(app).get('/api/user').set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(ana);
  });

  test('sin sesión → 401', async () => {
    const res = await request(app).get('/api/user');

    expect(res.status).toBe(401);
  });
});

describe('PUT /api/user', () => {
  test('datos correctos → 200, guarda y renueva la cookie', async () => {
    User.getById.mockResolvedValue(ana);
    User.getByEmail.mockResolvedValue(undefined); // el email nuevo está libre
    User.update.mockResolvedValue({ ...ana, name: 'Ana López', email: 'ana.lopez@test.com' });

    const res = await request(app)
      .put('/api/user')
      .set('Cookie', userCookie)
      .send({ name: 'Ana López', email: 'Ana.Lopez@test.com' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Ana López');
    // El email se guarda en minúsculas
    expect(User.update).toHaveBeenCalledWith(1, 'Ana López', 'ana.lopez@test.com');
    expect(res.headers['set-cookie'][0]).toMatch(/^token=/);
  });

  test.each([
    ['nombre vacío', { name: '   ', email: 'ana@test.com' }],
    ['email no válido', { name: 'Ana', email: 'esto no es un email' }],
  ])('%s → 400 y no se guarda', async (_, datos) => {
    const res = await request(app).put('/api/user').set('Cookie', userCookie).send(datos);

    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
    expect(User.update).not.toHaveBeenCalled();
  });

  test('email de otro usuario → 409 y no se guarda', async () => {
    User.getById.mockResolvedValue(ana);
    User.getByEmail.mockResolvedValue({ id: 2, email: 'admin@test.com' });

    const res = await request(app)
      .put('/api/user')
      .set('Cookie', userCookie)
      .send({ name: 'Ana', email: 'admin@test.com' });

    expect(res.status).toBe(409);
    expect(User.update).not.toHaveBeenCalled();
  });

  test('si entra con Google, el email no se cambia', async () => {
    User.getById.mockResolvedValue({ ...ana, provider: 'google' });
    User.getByEmail.mockResolvedValue(ana); // es su propio email
    User.update.mockResolvedValue({ ...ana, name: 'Ana López' });

    const res = await request(app)
      .put('/api/user')
      .set('Cookie', userCookie)
      .send({ name: 'Ana López', email: 'otro@test.com' });

    expect(res.status).toBe(200);
    expect(User.update).toHaveBeenCalledWith(1, 'Ana López', 'ana@test.com');
  });

  test('sin sesión → 401', async () => {
    const res = await request(app).put('/api/user').send({ name: 'Ana', email: 'ana@test.com' });

    expect(res.status).toBe(401);
  });
});
