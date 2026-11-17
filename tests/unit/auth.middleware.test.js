const jwt = require('jsonwebtoken');
const { verifyToken, requireRole, signToken } = require('../../middlewares/auth.middleware');

// Objetos req/res falsos para probar middlewares sin levantar el servidor
const mockReq = (overrides = {}) => ({ cookies: {}, originalUrl: '/dashboard', ...overrides });
const mockRes = () => {
  const res = { locals: {} };
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.redirect = jest.fn(() => res);
  res.clearCookie = jest.fn(() => res);
  return res;
};

const user = { id: 1, name: 'Ana', email: 'ana@test.com', role: 'user' };

describe('signToken', () => {
  test('genera un JWT con id, email, name y role', () => {
    const payload = jwt.verify(signToken(user), process.env.JWT_SECRET);
    expect(payload).toMatchObject(user);
  });
});

describe('verifyToken', () => {
  test('con token válido guarda el usuario en req.user y llama a next', () => {
    const req = mockReq({ cookies: { token: signToken(user) } });
    const res = mockRes();
    const next = jest.fn();
    verifyToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject(user);
    expect(res.locals.user).toMatchObject(user);
  });

  test('sin token en una vista redirige a /', () => {
    const res = mockRes();
    const next = jest.fn();
    verifyToken(mockReq(), res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/');
  });

  test('sin token en la API responde 401', () => {
    const res = mockRes();
    verifyToken(mockReq({ originalUrl: '/api/user' }), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('con token manipulado redirige a / y borra la cookie', () => {
    const res = mockRes();
    verifyToken(mockReq({ cookies: { token: 'token.falso.123' } }), res, jest.fn());
    expect(res.clearCookie).toHaveBeenCalledWith('token');
    expect(res.redirect).toHaveBeenCalledWith('/');
  });
});

describe('requireRole', () => {
  test('deja pasar si el rol está permitido', () => {
    const next = jest.fn();
    requireRole('user')(mockReq({ user }), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  test('un usuario que entra en zona de admin vuelve a /dashboard', () => {
    const res = mockRes();
    requireRole('admin')(mockReq({ user }), res, jest.fn());
    expect(res.redirect).toHaveBeenCalledWith('/dashboard');
  });

  test('un admin que entra en zona de usuario vuelve a /movies', () => {
    const res = mockRes();
    requireRole('user')(mockReq({ user: { ...user, role: 'admin' } }), res, jest.fn());
    expect(res.redirect).toHaveBeenCalledWith('/movies');
  });

  test('en la API responde 403 si el rol no está permitido', () => {
    const res = mockRes();
    requireRole('admin')(mockReq({ user, originalUrl: '/api/movie' }), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
