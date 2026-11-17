# Cómo trabajamos con Git

## Las ramas

```
main                    ← la versión buena, la que se entrega
 └─ develop             ← aquí juntamos el trabajo de todos
     ├─ feature_login
     ├─ feature_busqueda
     └─ feature_...     ← una rama por cada bloque de tareas
```

- Cada **bloque de tareas** tiene su rama. Puede ser una tarjeta de Trello sola o varias relacionadas (por ejemplo, crear, editar y borrar película van en `feature_admin_peliculas`).
- **El nombre está arriba del todo en cada tarjeta**, y te dice si en esa tarjeta **creas** la rama o **sigues** en ella.
- Una sola **Pull Request por rama**, cuando terminas la última tarjeta del bloque.
- Las ramas siempre se crean **desde `develop`**.
- Nadie puede subir directamente a `main` ni a `develop` (GitHub no te deja). Todo entra por **Pull Request**.

## Los pasos de cada bloque

**1. Antes de empezar** (en la primera tarjeta del bloque):

```bash
git checkout develop
git pull
git checkout -b feature_nombre_del_bloque
```

**2. Para guardar tu trabajo** (cuando algo funcione o al final del día). Si el bloque tiene varias tarjetas, hazlas todas aquí, una detrás de otra:

```bash
git add .
git commit -m "lo que has hecho"
git push origin feature_nombre_del_bloque
```

**3. Cuando termines la última tarjeta del bloque:**

1. Comprueba que todo funciona con `npm test`.
2. En GitHub, pulsa **Compare & pull request**.
3. Comprueba que pone **develop ← feature_nombre_del_bloque**.
4. Crea la Pull Request y avisa a un compañero para que la revise.
5. Cuando la apruebe, pulsa **Merge pull request**.

**4. Para empezar el siguiente bloque**, vuelve al paso 1.

## Todas las ramas

| Persona | Rama | Tarjetas de Trello |
|---|---|---|
| P1 | `feature_login` | Registro + Login + Logout |
| P1 | `feature_login_google` | Login con Google |
| P1 | `feature_perfil` | Ver y editar perfil |
| P1 | `feature_gestion_usuarios` | Gestión de usuarios (Sprint 2) |
| P1 | `feature_entrega_final` | Quitar rutas de desarrollo + documentación (Sprint 2) |
| P2 | `feature_busqueda` | Servicio OMDB + Búsqueda OMDB → MongoDB |
| P2 | `feature_vistas_busqueda` | Vista del buscador + Vista de detalle |
| P2 | `feature_mejoras_busqueda` | Sin resultados + Responsive + documentación (Sprint 2) |
| P2 | `feature_tests_usuario` | Tests e2e del usuario (Sprint 2) |
| P3 | `feature_admin_peliculas` | Listado + Crear + Editar + Borrar película |
| P3 | `feature_favoritos` | Añadir a favoritos |
| P3 | `feature_mis_peliculas` | Mis películas + documentación (Sprint 2) |
| P3 | `feature_tests_admin` | Tests e2e del admin (Sprint 2) |

## Revisar la Pull Request de un compañero

1. En GitHub, ve a la pestaña **Pull requests** y abre la suya.
2. En **Files changed** ves lo que ha cambiado.
3. Si está bien, pulsa **Review changes**, luego **Approve** y luego **Submit review**.

## Si algo sale mal

- **He trabajado en develop sin crear mi rama:** escribe `git checkout -b feature_nombre_del_bloque` y tus cambios se pasan a la rama nueva.
- **GitHub dice "rejected" al hacer push:** estás en `develop`. Crea tu rama (punto anterior).
- **GitHub dice que hay conflictos en mi Pull Request:** avisa al Scrum Master y lo resolvemos juntos.
- **No sé qué ha pasado:** no borres nada ni uses `--force`. Pregunta en el grupo.

## Reglas básicas

- Nunca subas el archivo `.env`, porque tiene contraseñas.
- Si instalas un paquete nuevo con npm, avisa al grupo.
- Los archivos que usamos todos (`app.js`, `package.json`, `views/layout.pug`, `public/css/style.css`, `models/movie.model.js`) no se tocan sin avisar.
