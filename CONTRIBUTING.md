# Cómo trabajamos con Git

## Ramas

```
main      ← solo lo que se entrega. Nadie sube cambios directamente.
develop   ← integración. Todo entra aquí por Pull Request.
feature/* ← una rama por tarea del backlog, sale de develop.
fix/*     ← para arreglar bugs.
```

Nombres: `feature/login-jwt`, `feature/omdb-service`, `feature/favorites-api`, `fix/menu-mobile`…

## Flujo de cada tarea

1. Coge una tarea del backlog y muévela a "En curso".
2. Actualiza `develop` y crea tu rama:
   ```bash
   git switch develop
   git pull
   git switch -c feature/nombre-tarea
   ```
3. TDD: escribe el test, verlo fallar, escribe el código, verlo pasar.
4. Haz commits pequeños y frecuentes (ver formato abajo).
5. Antes de abrir el PR, trae lo último de `develop` y comprueba que los tests pasan:
   ```bash
   git pull origin develop
   npm test
   ```
6. Sube la rama y abre un **Pull Request hacia `develop`** (no hacia `main`).
7. **Otra persona** del equipo lo revisa y lo aprueba. Nadie mergea su propio PR.
8. Después del merge, borra la rama.

`develop` se mergea en `main` al final de cada sprint, cuando todo funciona.

## Commits

Formato: `tipo: descripción en presente`

| Tipo | Para |
|---|---|
| `feat` | funcionalidad nueva |
| `fix` | arreglo de un bug |
| `test` | tests |
| `docs` | documentación (README, JSDoc, Swagger) |
| `style` | CSS / formato |
| `refactor` | cambiar código sin cambiar lo que hace |
| `chore` | configuración, dependencias |

Ejemplos: `feat: login con JWT en cookie`, `test: tests de omdb.service`, `fix: menú no se cierra en móvil`.

## Archivos compartidos (avisar antes de tocarlos)

Estos archivos los usamos los tres. Si hay que cambiarlos, avísalo en el grupo y hazlo en un PR pequeño y separado:

- `app.js`, `package.json`
- `models/movie.model.js` (el formato de película)
- `middlewares/auth.middleware.js`
- `views/layout.pug`, `views/partials/*`, `public/css/style.css` (la parte de `:root` y las clases comunes)
- `db/schema.sql`

**Dependencias nuevas:** quien la instala sube `package.json` **y** `package-lock.json` en el mismo commit.

## Conflictos

Si al hacer `git pull origin develop` hay conflictos:
1. Abre los archivos marcados y decide qué código se queda (si es código de otro, pregúntale).
2. Comprueba que `npm test` pasa.
3. Después:
   ```bash
   git add .
   git commit
   ```
