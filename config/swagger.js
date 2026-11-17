/**
 * Configuración de Swagger. Lee los comentarios @openapi de los archivos de rutas.
 * Documentación disponible en http://localhost:3000/api-docs
 * @module config/swagger
 */
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Movie App API',
      version: '0.1.0',
      description: 'API de búsqueda y gestión de películas (The Bridge)',
    },
    components: {
      securitySchemes: {
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' },
      },
      schemas: {
        Movie: {
          type: 'object',
          description: 'Formato común de película, venga de OMDB o de MongoDB',
          properties: {
            id: { type: 'string', example: 'tt0076759' },
            source: { type: 'string', enum: ['omdb', 'mongo'] },
            title: { type: 'string', example: 'Star Wars' },
            poster: { type: 'string', example: 'https://...' },
            year: { type: 'string', example: '1977' },
            director: { type: 'string', example: 'George Lucas' },
            genre: { type: 'string', example: 'Action, Adventure, Fantasy' },
            runtime: { type: 'string', example: '121 min' },
            plot: { type: 'string' },
            actors: { type: 'string' },
            rating: { type: 'string', example: '8.6' },
          },
        },
      },
    },
  },
  apis: ['./routes/**/*.js'],
});

module.exports = swaggerSpec;
