// El modelo de usuario es "de mentira": no se toca la base de datos
jest.mock('../../models/user.model');
const request = require('supertest');
const User = require('../../models/user.model');
const app = require('../../app');

const bcrypt = require('bcryptjs');

describe('POST /api/signup', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('registro válido: redirige a /dashboard y deja la cookie token', async () => {
    User.getByEmail.mockResolvedValue(undefined); // el email no existe todavía
    User.create.mockResolvedValue({ id: 3, name: 'Ana', email: 'ana@test.com', role: 'user' });

    const res = await request(app)
      .post('/api/signup')
      .type('form') // se envía como el formulario de la web
      .send({ name: 'Ana', email: 'ana@test.com', password: '123456' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/dashboard');
    expect(res.headers['set-cookie'][0]).toMatch(/^token=/);
  });

  test('la contraseña se guarda cifrada, nunca tal cual', async () => {
    User.getByEmail.mockResolvedValue(undefined);
    User.create.mockResolvedValue({ id: 3, name: 'Ana', email: 'ana@test.com', role: 'user' });

    await request(app)
      .post('/api/signup')
      .type('form')
      .send({ name: 'Ana', email: 'ana@test.com', password: '123456' });

    const passwordGuardada = User.create.mock.calls[0][2]; // tercer dato que recibió create
    expect(passwordGuardada).not.toBe('123456');
    expect(passwordGuardada).toMatch(/^\$2/); // empieza como un hash de bcrypt
  });

  test('email repetido → 400 y no se crea el usuario', async () => {
    User.getByEmail.mockResolvedValue({ id: 1, email: 'ana@test.com' }); // ya existe

    const res = await request(app)
      .post('/api/signup')
      .type('form')
      .send({ name: 'Ana', email: 'ana@test.com', password: '123456' });

    expect(res.status).toBe(400);
    expect(res.text).toContain('Ese email ya está registrado');
    expect(User.create).not.toHaveBeenCalled();
  });

  test('email no válido → 400', async () => {
    const res = await request(app)
      .post('/api/signup')
      .type('form')
      .send({ name: 'Ana', email: 'esto-no-es-un-email', password: '123456' });

    expect(res.status).toBe(400);
    expect(User.create).not.toHaveBeenCalled();
  });

  test('contraseña corta → 400', async () => {
    const res = await request(app)
      .post('/api/signup')
      .type('form')
      .send({ name: 'Ana', email: 'ana@test.com', password: '123' });

    expect(res.status).toBe(400);
  });
});


describe('POST /api/login', () => {
  // Contraseña "123456" cifrada, como estaría guardada en la base de datos
  // (el 4 en vez de 10 es solo para que el test vaya más rápido)
  const hash = bcrypt.hashSync('123456', 4);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('login correcto de user: redirige a /dashboard y deja la cookie token', async () => {
    User.getByEmail.mockResolvedValue({ id: 1, name: 'User', email: 'user@test.com', password: hash, role: 'user' });

    const res = await request(app)
      .post('/api/login')
      .type('form')
      .send({ email: 'user@test.com', password: '123456' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/dashboard');
    expect(res.headers['set-cookie'][0]).toMatch(/^token=/);
  });

  test('login correcto de admin: redirige a /movies', async () => {
    User.getByEmail.mockResolvedValue({ id: 2, name: 'Admin', email: 'admin@test.com', password: hash, role: 'admin' });

    const res = await request(app)
      .post('/api/login')
      .type('form')
      .send({ email: 'admin@test.com', password: '123456' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/movies');
  });

  test('contraseña incorrecta → 401 con mensaje y sin cookie', async () => {
    User.getByEmail.mockResolvedValue({ id: 1, name: 'User', email: 'user@test.com', password: hash, role: 'user' });

    const res = await request(app)
      .post('/api/login')
      .type('form')
      .send({ email: 'user@test.com', password: 'mala' });

    expect(res.status).toBe(401);
    expect(res.text).toContain('Email o contraseña incorrectos');
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test('email que no existe → 401 con el mismo mensaje', async () => {
    User.getByEmail.mockResolvedValue(undefined); // no hay nadie con ese email

    const res = await request(app)
      .post('/api/login')
      .type('form')
      .send({ email: 'nadie@test.com', password: '123456' });

    expect(res.status).toBe(401);
    expect(res.text).toContain('Email o contraseña incorrectos');
  });
});

describe('POST /api/logout', () => {
  test('borra la cookie y redirige al login', async () => {
    const res = await request(app).post('/api/logout');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
    // clearCookie deja la cookie vacía: "token=; ..."
    expect(res.headers['set-cookie'][0]).toMatch(/^token=;/);
  });
});
