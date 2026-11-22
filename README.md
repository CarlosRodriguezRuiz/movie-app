# 🎬 Movie App

Aplicación web para **buscar películas**, guardarlas en favoritos y gestionar un catálogo propio. El usuario busca por título y ve las coincidencias con su ficha; el administrador añade las películas que no existen en el catálogo público. Proyecto backend del Bootcamp Full Stack de The Bridge, hecho en equipo de 3 personas.

- **Stack:** Node.js · Express 5 · Pug (renderizado en servidor) · PostgreSQL · MongoDB · API OMDB
- **Seguridad:** JWT en cookie `httpOnly` · contraseñas con bcrypt · login con Google (Passport) · roles `user` y `admin`
- **Calidad:** Jest + Supertest (TDD) · JSDoc · Swagger · diseño mobile-first

## 💡 La idea en 30 segundos

Hay **dos orígenes de películas** y el usuario no tiene por qué saberlo:

| Origen | Qué contiene | Dónde vive |
|---|---|---|
| **OMDB** | Miles de películas reales (API externa) | Nunca se guardan en nuestra BBDD |
| **Mongo** | Películas que crea el administrador y OMDB no conoce | MongoDB |

La **búsqueda unificada** decide por nosotros: primero OMDB; si no hay nada, MongoDB; si tampoco, lista vacía.

```
título ─► OMDB ──── hay resultados ───► se devuelven (no se guardan)
            │ no
            ▼
         MongoDB (películas del admin, por título sin distinguir mayúsculas) ─ hay ─► se devuelven
            │ no
            ▼
          lista vacía
```

Venga de donde venga, la película llega a las vistas con **el mismo formato** (`id`, `source`, `title`, `poster`, `year`, `director`, `genre`, `runtime`, `plot`, `actors`, `rating`). Así las vistas no necesitan saber el origen.

## 👤 Qué puede hacer cada rol

| Usuario (`user`) | Administrador (`admin`) |
|---|---|
| Registrarse, entrar (email o Google) y cerrar sesión | Entrar y cerrar sesión |
| Buscar películas y ver el detalle | **Crear, editar y borrar** películas de MongoDB (con validación) |
| **Añadir a favoritos** y ver «Mis películas» (y quitarlas) | Al borrar una película, también se borran sus favoritos |
| | **Crear, editar y eliminar usuarios**, eligiendo su rol |
| Ver y editar su perfil | Ver y editar su perfil |

Tras el login, el usuario va a `/dashboard` y el administrador a `/movies`.

## 📸 Recorrido por la app

### Entrar
Acceso con email y contraseña o con Google; desde aquí se llega también al registro.

<p align="center"><img src="docs/img/login.png" alt="Pantalla de login" width="60%"></p>

### Panel de películas (admin)
El administrador ve solo las películas de MongoDB, es decir, las que **no** existen en OMDB. «Crear nueva» abre el formulario (con validación de los datos) y cada tarjeta tiene **Editar** y **Eliminar**.

<p align="center"><img src="docs/img/admin-peliculas.png" alt="Panel de películas: formulario para crear o editar y tarjeta con Editar y Eliminar" width="70%"></p>

### Gestión de usuarios (admin)
Alta, edición y baja de usuarios, eligiendo su rol (`user` o `admin`). Los que se registraron con Google aparecen marcados.

<p align="center"><img src="docs/img/admin-usuarios.png" alt="Gestión de usuarios" width="80%"></p>

### Perfil
Cada persona edita su nombre y su email; el rol solo se muestra.

<p align="center"><img src="docs/img/perfil.png" alt="Perfil del usuario" width="80%"></p>

## 🏗️ Cómo está montado

```
Navegador ─► routes ─► middlewares (verifyToken · requireRole · validate)
                              │
                              ▼
                         controllers ─► views (Pug)
                              │
                 ┌────────────┴─────────────┐
                 ▼                          ▼
             services                    models
   (OMDB + búsqueda unificada)    (PostgreSQL · MongoDB)
```

**Un ejemplo, paso a paso:** el usuario busca `matrix` en `/search`.

1. La ruta pasa por `verifyToken` (¿hay sesión?) y `requireRole('user')` (¿es usuario?).
2. `searchView` llama a `movies.service.search('matrix')`.
3. El servicio pregunta a `omdb.service`, que hace `fetch` a OMDB y devuelve las películas en el formato común.
4. Si OMDB no trae nada, busca en MongoDB con `movie.model`.
5. La vista `search.pug` pinta una tarjeta por película, con «Ver detalle» y «Añadir a Favoritos».

**Dónde vive cada dato**

- **PostgreSQL:** usuarios y favoritos. Los favoritos guardan solo la relación `user_id + movie_id + source`, nunca los datos de la película.
- **MongoDB:** las películas creadas por el administrador.
- **OMDB:** consultas en vivo; la API key va en `.env`.
- Si OMDB falla (sin conexión, clave inválida), **el error se muestra**: no se oculta cayendo a MongoDB.

## 👥 Equipo y reparto

**Equipo:** Carlos Rodríguez Ruiz · Alejandro Sancho Hinojosa · Julián Muñoz

Cada persona se encargó de una parte completa (ruta, controlador, modelo, vista, tests y Swagger), y algunas tareas se cubrieron entre varios.

| Parte | Qué se construyó |
|---|---|
| **P1 · Auth y usuarios** (Scrum Master) | Registro con validación y bcrypt, login, logout, login con Google, perfil editable, middlewares `verifyToken` y `requireRole` |
| **P2 · Búsqueda** | `omdb.service` (tests con `fetch` simulado), `movies.service` (búsqueda unificada), vista del buscador con tarjetas y vista de detalle, revisión del JSDoc |
| **P3 · Admin y favoritos** | Panel `/movies` (listar, crear, editar y borrar), favoritos, rediseño de estilos |

El **Sprint 0** (estructura, Express, Pug, CSS base, conexiones a las BBDD, Swagger y middlewares) lo hicimos entre todos.

## 🔄 Cómo hemos trabajado

- **Trello** con una tarjeta por historia de usuario y su checklist.
- **Git Flow sencillo:** `main` (la entrega) ← `develop` (todo junto) ← `feature_*` (una rama por bloque de tareas, siempre creada desde `develop`).
- **Una Pull Request por rama**, revisada por un compañero. Nadie sube directo a `main` ni a `develop`.
- **TDD:** primero el test, luego el código. Ninguna PR se aprueba con tests en rojo.
- **Archivos compartidos** (`app.js`, `package.json`, `layout.pug`, `style.css`, `movie.model.js`): no se tocan sin avisar.
- Detalles en [CONTRIBUTING.md](CONTRIBUTING.md) y backlog en [docs/backlog.md](docs/backlog.md).

## 📊 Estado del proyecto

| Bloque | Estado |
|---|---|
| Sprint 0 · base del proyecto | ✅ Hecho |
| Auth: registro, login, logout, Google, perfil | ✅ Hecho |
| Búsqueda: servicio OMDB, búsqueda unificada, resultados y detalle | ✅ Hecho |
| Admin: listar, crear, editar y borrar películas | ✅ Hecho |
| Admin: gestión de usuarios (crear, editar y eliminar) | ✅ Hecho |
| Favoritos: añadir, ver «Mis películas» y quitar | ✅ Hecho |
| Estilos mobile-first con diseño para tablet y escritorio | ✅ Hecho |
| JSDoc y Swagger de los endpoints principales | ✅ Hecho |
| Bases de datos en la nube (PostgreSQL en Render · MongoDB Atlas): conexiones configuradas y probadas | ✅ Hecho |

## ☁️ Despliegue en la nube

Tres piezas, en dos servicios:

| Pieza | Dónde está |
|---|---|
| Servidor Node/Express | **Render** (servicio web conectado al repositorio de GitHub) |
| PostgreSQL (usuarios y favoritos) | **Render** (base de datos gestionada) |
| MongoDB (películas del admin) | **MongoDB Atlas** |

Configuración en Render (variables de entorno, las mismas del `.env.example`):

- **PostgreSQL:** `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` y `PGDATABASE` con los datos de la base de Render.
- **MongoDB:** `MONGO_URI` con la cadena de Atlas (con el acceso desde Render permitido en *Network Access*).
- **Producción:** `NODE_ENV=production` (desactiva `/dev/login`), `JWT_SECRET` larga y `OMDB_API_KEY`.
- **Google:** `GOOGLE_CALLBACK_URL` con la URL de producción (`https://<nuestra-app>.onrender.com/auth/google/callback`), dada de alta también en la consola de Google.

⚠️ `npm run db:init` **borra las tablas y mete usuarios de prueba** (contraseña `123456`). En producción hay que crear las tablas sin esos usuarios y dar de alta un admin real.

## 🚀 Puesta en marcha (en local)

```bash
npm install
cp .env.example .env     # y rellena tus valores (API key de OMDB, contraseña de Postgres...)
npm run db:init          # crea las tablas y los usuarios de prueba (borra los datos existentes)
npm run dev              # http://localhost:3000
```

Antes hay que tener PostgreSQL con la base `movie_app` creada (`CREATE DATABASE movie_app;`) y MongoDB arrancado. Guía detallada en [docs/INSTALACION.md](docs/INSTALACION.md).

Si todo va bien, el servidor confirma las dos conexiones y la dirección de Swagger:

<p align="center"><img src="docs/img/arranque.png" alt="Arranque del servidor con PostgreSQL y MongoDB conectados" width="60%"></p>

- **Swagger:** http://localhost:3000/api-docs
- **Usuarios de prueba:** `user@test.com` y `admin@test.com`, contraseña `123456`.
- **Solo desarrollo:** `/dev/login/user` y `/dev/login/admin` entran sin contraseña.

## 🧪 Tests

```bash
npm test
```

Más de 100 tests con **Jest y Supertest**:

- `tests/unit/`: servicios (OMDB con `fetch` simulado y respuestas reales guardadas en `tests/fixtures/`), búsqueda unificada, middlewares y modelo de usuario.
- `tests/integration/`: endpoints completos (registro y login, perfil, panel del admin, búsqueda y favoritos).

## 🗺️ Endpoints principales

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/`, `/login`, `/signup` | Público |
| POST | `/api/signup`, `/api/login`, `/api/logout` | Público |
| GET | `/auth/google` y `/auth/google/callback` | Público |
| GET | `/dashboard` | User |
| GET | `/search?title=...`, `/search/:title` | User |
| GET | `/api/movie/:title` | User |
| GET · POST · DELETE | `/api/favorites` · vista `/favorites` | User |
| GET | `/movies` | Admin |
| POST | `/api/movie` | Admin |
| PUT · DELETE | `/api/movie/:id` | Admin |
| GET | `/profile` | Logueado |
| GET · PUT | `/api/user` | Logueado |
| GET | `/users` (gestión de usuarios; sus operaciones están en Swagger) | Admin |

La documentación interactiva de la API está en `/api-docs`.

## 📁 Estructura

```
├── app.js · server.js   # Express (se importa en los tests) y arranque
├── config/              # Conexiones a PostgreSQL y MongoDB, Passport y Swagger
├── routes/              # Un archivo por funcionalidad (+ Swagger)
├── controllers/         # Lo que pasa en cada URL
├── models/              # SQL (user, favorite) y Mongoose (movie)
├── services/            # OMDB y búsqueda unificada
├── middlewares/         # verifyToken, requireRole, validate, errores
├── views/               # Plantillas Pug (layout, partials, tarjeta de película)
├── public/              # CSS mobile-first y JS del navegador
├── db/                  # schema.sql y seed.sql
├── tests/               # unit/ · integration/ · fixtures/
└── docs/                # Backlog e instalación
```

## 📐 Decisiones tomadas

- **Favoritos en `/favorites`:** el enunciado también la llama `/movies`, pero esa es la ruta del admin.
- **`PUT` y `DELETE /api/movie/:id`:** con el id en la URL.
- **Formato común de película:** lo devuelven igual OMDB y Mongo.
- **`?s=` de OMDB** no trae director, género ni duración: se pide el detalle de cada resultado con `getById` (`Promise.all`).
- **Un título con caracteres especiales** (`(`, `*`, `+`...) se escapa antes de usarlo como búsqueda en MongoDB.
- **Errores sin silencio:** si algo falla, sube al manejador de errores y devuelve un 500 claro.

## 🎤 Demo rápida (3 minutos)

1. Entrar como **admin** (`admin@test.com`) → `/movies` → **crear una película** que OMDB no conozca. De paso, enseñar `/users`.
2. Salir y entrar como **usuario** (`user@test.com`) → `/dashboard`.
3. Buscar `matrix` → resultados de **OMDB**, con su ficha y «Ver detalle».
4. Buscar la película creada por el admin → sale de **MongoDB** con el mismo formato.
5. **Añadir a favoritos** una de cada origen → `/favorites` → quitar una.
6. Enseñar `/api-docs` y ejecutar `npm test`.
