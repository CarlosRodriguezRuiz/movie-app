/**
 * Tests unitarios del servicio OMDB.
 * fetch está mockeado: no se hace ninguna petición real.
 */
const { searchByTitle, getById, normalize } = require('../../services/omdb.service');
const detailFixture = require('../fixtures/omdb-matrix-detail.json');
const searchFixture = require('../fixtures/omdb-search-matrix.json');

const NOT_FOUND = { Response: 'False', Error: 'Incorrect IMDb ID.' };
const NO_RESULTS = { Response: 'False', Error: 'Movie not found!' };

const MATRIX = {
  id: 'tt0133093',
  source: 'omdb',
  title: 'The Matrix',
  poster: detailFixture.Poster,
  year: '1999',
  director: 'Lana Wachowski, Lilly Wachowski',
  genre: 'Action, Sci-Fi',
  runtime: '136 min',
  plot: detailFixture.Plot,
  actors: 'Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss',
  rating: '8.7',
};

const jsonResponse = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: async () => body,
});

/**
 * Detalle de una película de la búsqueda. Solo tenemos el detalle real de
 * Matrix, así que el resto reutiliza ese detalle cambiando id, título, año y póster.
 */
const detailFor = (item) => ({
  ...detailFixture,
  Title: item.Title,
  Year: item.Year,
  imdbID: item.imdbID,
  Poster: item.Poster,
});

/** fetch de mentira: responde a ?s= con la búsqueda y a ?i= con el detalle. */
const mockOmdb = () => {
  global.fetch.mockImplementation(async (url) => {
    const params = new URL(url).searchParams;
    if (params.has('s')) return jsonResponse(searchFixture);
    const item = searchFixture.Search.find((m) => m.imdbID === params.get('i'));
    return jsonResponse(item ? detailFor(item) : NOT_FOUND);
  });
};

const paramsOfCall = (n) => new URL(global.fetch.mock.calls[n][0]).searchParams;

const originalFetch = global.fetch;
const originalKey = process.env.OMDB_API_KEY;

beforeEach(() => {
  process.env.OMDB_API_KEY = 'test-key';
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.OMDB_API_KEY;
  else process.env.OMDB_API_KEY = originalKey;
});

describe('normalize', () => {
  it('convierte los campos de OMDB al formato común', () => {
    expect(normalize(detailFixture)).toEqual(MATRIX);
  });

  it('convierte "N/A" en null', () => {
    const movie = normalize({ ...detailFixture, Director: 'N/A', Poster: 'N/A' });
    expect(movie.director).toBeNull();
    expect(movie.poster).toBeNull();
  });
});

describe('searchByTitle', () => {
  it('usa ?s= con la API key y normaliza bien los campos', async () => {
    mockOmdb();

    const movies = await searchByTitle('matrix');

    const searchParams = paramsOfCall(0);
    expect(searchParams.get('s')).toBe('matrix');
    expect(searchParams.get('apikey')).toBe('test-key');

    expect(movies).toHaveLength(searchFixture.Search.length);
    expect(movies[0]).toEqual(MATRIX);
    movies.forEach((movie) => {
      expect(movie.source).toBe('omdb');
      expect(movie.director).toBeTruthy();
      expect(movie.genre).toBeTruthy();
      expect(movie.runtime).toBeTruthy();
    });
  });

  it('pide el detalle de cada resultado (1 búsqueda + N detalles)', async () => {
    mockOmdb();

    await searchByTitle('matrix');

    expect(global.fetch).toHaveBeenCalledTimes(1 + searchFixture.Search.length);
    expect(paramsOfCall(1).get('i')).toBe('tt0133093');
    expect(paramsOfCall(1).get('plot')).toBe('full');
  });

  it('devuelve [] si OMDB responde "Response": "False"', async () => {
    global.fetch.mockResolvedValue(jsonResponse(NO_RESULTS));

    await expect(searchByTitle('asdfghjkl')).resolves.toEqual([]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('lanza error si falta OMDB_API_KEY', async () => {
    delete process.env.OMDB_API_KEY;

    await expect(searchByTitle('matrix')).rejects.toThrow('OMDB_API_KEY');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('getById', () => {
  it('usa ?i=&plot=full y devuelve la película normalizada', async () => {
    global.fetch.mockResolvedValue(jsonResponse(detailFixture));

    const movie = await getById('tt0133093');

    const params = paramsOfCall(0);
    expect(params.get('i')).toBe('tt0133093');
    expect(params.get('plot')).toBe('full');
    expect(params.get('apikey')).toBe('test-key');
    expect(movie).toEqual(MATRIX);
  });

  it('devuelve null si el id no existe', async () => {
    global.fetch.mockResolvedValue(jsonResponse(NOT_FOUND));

    await expect(getById('tt0000000')).resolves.toBeNull();
  });
});