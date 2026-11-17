/**
 * Configuración de la app Express (sin arrancar el servidor ni conectar BBDD,
 * para poder testearla con supertest). El arranque está en server.js.
 */
require('dotenv').config({ quiet: true });
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// ---- Motor de plantillas ----
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ---- Middlewares globales ----
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // formularios HTML
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.locals.user = null; // verifyToken lo rellena en las rutas privadas
  res.locals.currentPath = req.path;
  next();
});

// ---- Documentación ----
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---- Rutas (un archivo por funcionalidad: así no pisamos el código de otros) ----
app.use(require('./routes/auth.routes')); // Persona 1
app.use(require('./routes/users.routes')); // Persona 1
app.use(require('./routes/search.routes')); // Persona 2
app.use(require('./routes/movies.routes')); // Persona 3
app.use(require('./routes/favorites.routes')); // Persona 3
if (process.env.NODE_ENV !== 'production') app.use(require('./routes/dev.routes'));

// ---- Errores (siempre al final) ----
app.use(notFound);
app.use(errorHandler);

module.exports = app;
