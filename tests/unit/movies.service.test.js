/**
 * Tests unitarios de la búsqueda unificada OMDB -> MongoDB.
 * omdb.service y el modelo de Mongo están mockeados con jest.mock:
 * no se hace ninguna petición real ni hace falta base de datos.
 */
jest.mock('../../services/omdb.service', () => ({
  searchByTitle: jest.fn(),
  getById: jest.fn(),
}));
jest.mock('../../models/movie.model', () => ({
  find: jest.fn(),
  findById: jest.fn(),
}));

const omdbService = require('../../services/omdb.service');
const Movie = require('../../models/movie.model');
const { search, getById } = require('../../services/movies.service');

const MONGO_ID = '507f1f77bcf86cd799439011';

const omdbMovie = {
  id: 'tt0133093',
  source: 'omdb',
  title: 'The Matrix',
  poster: 'https://example.com/matrix.jpg',
  year: '1999',
  director: 'Lana Wachowski, Lilly Wachowski',
  genre: 'Action, Sci-Fi',
  runtime: '136 min',
  plot: 'Un hacker descubre la verdad.',
  actors: 'Keanu Reeves',
  rating: '8.7',
};

const mongoMovie = {
  id: MONGO_ID,
  source: 'mongo',
  title: 'Mi película casera',
  poster: 'https://example.com/casera.jpg',
  year: '2024',
  director: 'Admin',
  genre: 'Drama',
  runtime: '90 min',
  plot: '',
  actors: '',
  rating: '',
};

/** Documento de Mongoose de mentira: solo necesita toMovie(). */
const mongoDoc = (movie) => ({ toMovie: () => movie });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('search', () => {
  it('devuelve lo de OMDB si hay resultados y NO consulta Mongo', async () => {
    omdbService.searchByTitle.mockResolvedValue([omdbMovie]);

    const result = await search('matrix');

    expect(result).toEqual([omdbMovie]);
    expect(omdbService.searchByTitle).toHaveBeenCalledWith('matrix');
    expect(Movie.find).not.toHaveBeenCalled();
  });

  it('si OMDB no da nada, busca en Mongo por título (regex, sin mayúsculas)', async () => {
    omdbService.searchByTitle.mockResolvedValue([]);
    Movie.find.mockResolvedValue([mongoDoc(mongoMovie)]);

    const result = await search('casera');

    expect(Movie.find).toHaveBeenCalledWith({
      title: { $regex: 'casera', $options: 'i' },
    });
    expect(result).toEqual([mongoMovie]);
  });

  it('devuelve [] si ni OMDB ni Mongo tienen resultados', async () => {
    omdbService.searchByTitle.mockResolvedValue([]);
    Movie.find.mockResolvedValue([]);

    await expect(search('asdfghjkl')).resolves.toEqual([]);
  });

  it('escapa los caracteres especiales de regex del título', async () => {
    omdbService.searchByTitle.mockResolvedValue([]);
    Movie.find.mockResolvedValue([]);

    await search('Mission: Impossible (1996)');

    expect(Movie.find).toHaveBeenCalledWith({
      title: { $regex: 'Mission: Impossible \\(1996\\)', $options: 'i' },
    });
  });

  it('devuelve [] con un título vacío sin consultar ningún origen', async () => {
    await expect(search('   ')).resolves.toEqual([]);
    await expect(search(undefined)).resolves.toEqual([]);

    expect(omdbService.searchByTitle).not.toHaveBeenCalled();
    expect(Movie.find).not.toHaveBeenCalled();
  });

  it('si OMDB falla, propaga el error y no cae en silencio a Mongo', async () => {
    omdbService.searchByTitle.mockRejectedValue(new Error('OMDB caído'));

    await expect(search('matrix')).rejects.toThrow('OMDB caído');
    expect(Movie.find).not.toHaveBeenCalled();
  });
});

describe('getById', () => {
  it("con source 'omdb' devuelve la película de OMDB", async () => {
    omdbService.getById.mockResolvedValue(omdbMovie);

    await expect(getById('tt0133093', 'omdb')).resolves.toEqual(omdbMovie);
    expect(omdbService.getById).toHaveBeenCalledWith('tt0133093');
    expect(Movie.findById).not.toHaveBeenCalled();
  });

  it("con source 'omdb' devuelve null si no existe", async () => {
    omdbService.getById.mockResolvedValue(null);

    await expect(getById('tt0000000', 'omdb')).resolves.toBeNull();
  });

  it("con source 'mongo' devuelve la película de Mongo en formato común", async () => {
    Movie.findById.mockResolvedValue(mongoDoc(mongoMovie));

    await expect(getById(MONGO_ID, 'mongo')).resolves.toEqual(mongoMovie);
    expect(Movie.findById).toHaveBeenCalledWith(MONGO_ID);
    expect(omdbService.getById).not.toHaveBeenCalled();
  });

  it("con source 'mongo' devuelve null si no existe", async () => {
    Movie.findById.mockResolvedValue(null);

    await expect(getById(MONGO_ID, 'mongo')).resolves.toBeNull();
  });

  it("con source 'mongo' y un id inválido devuelve null sin consultar la BBDD", async () => {
    await expect(getById('no-es-un-objectid', 'mongo')).resolves.toBeNull();

    expect(Movie.findById).not.toHaveBeenCalled();
  });

  it('lanza error si el source no es válido', async () => {
    await expect(getById('tt0133093', 'netflix')).rejects.toThrow('Origen de película no válido');
  });
});