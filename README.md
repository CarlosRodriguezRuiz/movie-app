# 🎬 Movie App

Aplicación web de búsqueda y gestión de películas. Proyecto backend del Bootcamp Full Stack de The Bridge.

- **Stack:** Node 22 · Express 5 · Pug (SSR) · PostgreSQL · MongoDB · API OMDB
- **Auth:** JWT en cookie httpOnly + OAuth con Google (Passport)
- **Calidad:** Jest + Supertest (TDD) · JSDoc · Swagger
- **Diseño:** mobile-first

## 👥 Equipo y reparto

| Persona | Funcionalidad | Archivos principales |
|---|---|---|
| **Persona 1** (Scrum Master) | Auth y usuarios: signup, login, logout, OAuth, perfil, CRUD de usuarios (admin) | `auth.*`, `users.*`, `user.model.js`, vistas `login`, `signup`, `dashboard`, `profile`, `users` |
| **Persona 2** | Búsqueda: OMDB → MongoDB, vista de resultados y detalle | `search.*`, `services/omdb.service.js`, `services/movies.service.js`, vistas `search`, `movie-detail` |
| **Persona 3** | Películas del admin (MongoDB) y favoritos (SQL) | `movies.*`, `favorites.*`, `favorite.model.js`, vistas `admin-movies`, `favorites` |

> Cada uno hace su parte completa: ruta + controlador + modelo + vista + CSS + tests + Swagger.

## 🚀 Puesta en marcha

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar `.env.example` a `.env` y rellenar los valores (API key de OMDB, contraseña de Postgres...).
3. Crear la base de datos vacía en PostgreSQL (`CREATE DATABASE movie_app;`) y después crear las tablas y los usuarios de prueba:
   ```bash
   npm run db:init
   ```
4. Tener MongoDB arrancado (local o Atlas, según `MONGO_URI`).
5. Arrancar en modo desarrollo:
   ```bash
   npm run dev
   ```
6. Abrir http://localhost:3000 · Swagger en http://localhost:3000/api-docs

### Entrar sin login (solo desarrollo)

Mientras el login real no está terminado:

- http://localhost:3000/dev/login/user → entra como usuario de prueba
- http://localhost:3000/dev/login/admin → entra como admin de prueba

Usuarios de prueba en la BBDD: `user@test.com` y `admin@test.com`, contraseña `123456`.

## 🧪 Tests

```bash
npm test
```

TDD: **primero el test, luego el código.** Los tests unitarios van en `tests/unit/` y los de endpoints en `tests/integration/`. Ningún PR se aprueba con tests en rojo.

## 📁 Estructura

```
├── app.js              # Configuración de Express (se importa en los tests)
├── server.js           # Conecta las BBDD y arranca el servidor
├── config/             # Conexiones a PostgreSQL y MongoDB, y Swagger
├── routes/             # Un archivo por funcionalidad (+ Swagger con @openapi)
├── controllers/        # Lógica de cada endpoint
├── models/             # SQL (user, favorite) y Mongoose (movie)
├── services/           # OMDB y búsqueda unificada OMDB → Mongo
├── middlewares/        # verifyToken, requireRole, validate, errores
├── utils/
├── views/              # Plantillas Pug (layout + partials)
├── public/             # CSS mobile-first y JS del cliente
├── db/                 # schema.sql y seed.sql
├── scripts/            # db-init.js
├── tests/              # unit/ e integration/
└── docs/               # Backlog, decisiones, wireframes
```

## 🗺️ Endpoints

| Método | Ruta | Acceso | Responsable |
|---|---|---|---|
| GET | `/`, `/login`, `/signup` | Público | P1 |
| GET | `/dashboard` | User | P1 |
| GET | `/profile` | User / Admin | P1 |
| GET | `/users` | Admin | P1 |
| GET | `/search`, `/search/:title` | User | P2 |
| GET | `/favorites` | User | P3 |
| GET | `/movies` | Admin | P3 |
| POST | `/api/signup`, `/api/login`, `/api/logout` | Público | P1 |
| GET / PUT / DELETE | `/api/user` | Logueado (DELETE: admin) | P1 |
| GET | `/api/movie/:title` | Logueado | P2 |
| POST | `/api/movie` | Admin | P3 |
| PUT / DELETE | `/api/movie/:id` | Admin | P3 |
| GET / POST / DELETE | `/api/favorites` | User | P3 |

## 📐 Decisiones tomadas (sobre puntos ambiguos del enunciado)

- **Favoritos del usuario en `/favorites`** (el enunciado también lo llama `/movies`, pero esa ruta es la del admin).
- **`PUT` y `DELETE /api/movie/:id`**: con id en la URL.
- **Login**: el usuario va a `/dashboard` y el admin a `/movies`.
- **Formato común de película** (`id`, `source`, `title`, `poster`, `year`, `director`, `genre`, `runtime`, `plot`, `actors`, `rating`): lo devuelven igual OMDB y Mongo, así las vistas no saben de dónde viene. Ver `services/omdb.service.js`.
- **Favoritos en SQL**: solo `user_id + movie_id + source`. Nunca se copian los datos de la película.

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para el flujo de trabajo con Git y [docs/backlog.md](docs/backlog.md) para el backlog.
