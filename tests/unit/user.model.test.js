// La base de datos es "de mentira": no se conecta a PostgreSQL de verdad
jest.mock('../../config/db.sql');
const { query } = require('../../config/db.sql');
const User = require('../../models/user.model');

describe('user.model', () => {
  // Antes de cada test, "limpiamos" la base de datos de mentira
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('getByEmail devuelve el usuario si existe', async () => {
    // Le decimos qué tiene que responder la base de datos
    query.mockResolvedValue({ rows: [{ id: 1, email: 'ana@test.com' }] });

    const user = await User.getByEmail('ana@test.com');

    expect(user.email).toBe('ana@test.com');
    // Comprobamos que se usa una consulta con parámetro ($1) y el email aparte
    expect(query).toHaveBeenCalledWith(expect.stringContaining('$1'), ['ana@test.com']);
  });

  test('getByEmail devuelve undefined si no existe', async () => {
    query.mockResolvedValue({ rows: [] });

    const user = await User.getByEmail('nadie@test.com');

    expect(user).toBeUndefined();
  });

  test('create inserta el usuario y lo devuelve', async () => {
    query.mockResolvedValue({
      rows: [{ id: 3, name: 'Ana', email: 'ana@test.com', role: 'user' }],
    });

    const user = await User.create('Ana', 'ana@test.com', 'hash_de_bcrypt');

    expect(user).toEqual({ id: 3, name: 'Ana', email: 'ana@test.com', role: 'user' });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      ['Ana', 'ana@test.com', 'hash_de_bcrypt', 'local', 'user']
    );
  });
});
