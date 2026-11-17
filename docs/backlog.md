# Backlog · Movie App

Story points (SP) con la escala Fibonacci: 1 · 2 · 3 · 5 · 8. **P1** = Persona 1 (Scrum Master), **P2** = Persona 2, **P3** = Persona 3.

> Consejo: pasad estas historias a **GitHub Issues + GitHub Projects** (tablero con las columnas Por hacer / En curso / En revisión / Hecho). Cada issue = una rama = un PR.

## Sprint 0 · Base del proyecto ✅

| # | Historia | SP | Quién |
|---|---|---|---|
| 0.1 | Estructura de carpetas, Express, Pug, CSS base mobile-first, menú hamburguesa | 3 | P1 |
| 0.2 | Middlewares `verifyToken` y `requireRole` con tests | 2 | P1 |
| 0.3 | Conexiones a PostgreSQL y MongoDB, esquema SQL, seed y Swagger | 2 | P1 |

## Sprint 1 · Funcionalidad principal

### Auth y usuarios (P1)
| # | Historia | SP |
|---|---|---|
| 1.1 | Como usuario quiero **registrarme** con nombre, email y contraseña (hash con bcrypt, validación) | 3 |
| 1.2 | Como usuario quiero **hacer login** con email y contraseña y que se abra la sesión (JWT en cookie) | 3 |
| 1.3 | Como usuario quiero **cerrar sesión** | 1 |
| 1.4 | Como usuario quiero **entrar con Google** (OAuth con Passport) | 5 |
| 1.5 | Como usuario/admin quiero **ver y editar mi perfil** (`/profile`, `GET/PUT /api/user`) | 3 |

### Búsqueda (P2)
| # | Historia | SP |
|---|---|---|
| 2.1 | `omdb.service`: buscar por título y obtener por id, normalizado al formato común (con tests y *mock* de fetch) | 5 |
| 2.2 | `movies.service`: buscar en OMDB y, si no hay nada, en MongoDB | 3 |
| 2.3 | Como usuario quiero **buscar películas** y ver los resultados en tarjetas (`/search`, `GET /api/movie/:title`) | 3 |
| 2.4 | Como usuario quiero ver el **detalle** de una película con sinopsis, actores y rating (`/search/:title`) | 3 |

### Admin y favoritos (P3)
| # | Historia | SP |
|---|---|---|
| 3.1 | Como admin quiero **ver el listado** de películas de MongoDB (`/movies`) | 2 |
| 3.2 | Como admin quiero **crear** una película con validación (`POST /api/movie`) | 3 |
| 3.3 | Como admin quiero **editar** una película con el formulario ya relleno (`PUT /api/movie/:id`) | 3 |
| 3.4 | Como admin quiero **borrar** una película con confirmación, y que se borren sus favoritos | 3 |
| 3.5 | Como usuario quiero **añadir a favoritos** desde los resultados de búsqueda y desde el detalle (`POST /api/favorites`) | 3 |

## Sprint 2 · Completar y pulir

| # | Historia | SP | Quién |
|---|---|---|---|
| 4.1 | Como admin quiero **gestionar usuarios**: crear, editar y borrar (`/users`, `DELETE /api/user`) | 5 | P1 |
| 4.2 | Como usuario quiero ver **Mis películas** y quitar las que no quiera (`/favorites`, `GET/DELETE /api/favorites`) | 3 | P3 |
| 4.3 | Mensaje de "No hay resultados" y gestión de errores de OMDB (clave inválida, sin conexión) | 2 | P2 |
| 4.4 | Repaso de los estilos responsive en todas las vistas | 2 | P2 |
| 4.5 | Tests e2e de los flujos principales (login → buscar → añadir favorito → quitarlo) | 5 | P2 + P3 |
| 4.6 | Swagger completo, JSDoc revisado y README final | 2 | Todos |
| 4.7 | Quitar `routes/dev.routes.js` y preparar la entrega (merge `develop` → `main`) | 1 | P1 |

**Total:** P1 ≈ 21 SP · P2 ≈ 21 SP · P3 ≈ 19 SP (+ e2e compartido)

## Dependencias entre personas

- **P3 necesita de P2** `movies.service.getById(id, source)` para pintar los favoritos → P2 debe hacer pronto la historia **2.1/2.2**, o como mínimo dejar acordada la función.
- **P2 y P3 necesitan el login** solo al final: mientras tanto usan `/dev/login/user` y `/dev/login/admin`.
- El formato común de película está en `models/movie.model.js` y en `services/omdb.service.js`: **no cambiarlo sin avisar.**

## Ceremonias (versión bootcamp)

- **Daily** de 10 minutos: qué hice, qué voy a hacer y si estoy bloqueado.
- **Revisión de PRs** al menos una vez al día, para que nadie se quede esperando.
- **Al final de cada sprint:** demo, retrospectiva rápida y merge `develop` → `main`.
