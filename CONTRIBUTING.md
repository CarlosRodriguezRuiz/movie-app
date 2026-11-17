# Cómo trabajamos con Git

## Las ramas

```
main                    ← la versión buena, la que se entrega
 └─ develop             ← aquí juntamos el trabajo de todos
     ├─ feature_registro
     ├─ feature_api_omdb
     └─ feature_...     ← una rama por cada tarea de Trello
```

- Cada tarea de Trello tiene su rama. **El nombre está arriba del todo en la tarjeta.**
- Las ramas siempre se crean **desde `develop`**.
- Nadie puede subir directamente a `main` ni a `develop` (GitHub no te deja). Todo entra por **Pull Request**.

## Los pasos de cada tarea

**1. Antes de empezar:**

```bash
git checkout develop
git pull
git checkout -b feature_nombre_de_la_tarea
```

**2. Para guardar tu trabajo** (cuando algo funcione o al final del día):

```bash
git add .
git commit -m "lo que has hecho"
git push origin feature_nombre_de_la_tarea
```

**3. Cuando termines la tarea:**

1. Comprueba que todo funciona con `npm test`.
2. En GitHub, pulsa **Compare & pull request**.
3. Comprueba que pone **develop ← feature_nombre_de_la_tarea**.
4. Crea la Pull Request y avisa a un compañero para que la revise.
5. Cuando la apruebe, pulsa **Merge pull request**.

**4. Para empezar la siguiente tarea**, vuelve al paso 1.

## Revisar la Pull Request de un compañero

1. En GitHub, ve a la pestaña **Pull requests** y abre la suya.
2. En **Files changed** ves lo que ha cambiado.
3. Si está bien, pulsa **Review changes**, luego **Approve** y luego **Submit review**.

## Si algo sale mal

- **He trabajado en develop sin crear mi rama:** escribe `git checkout -b feature_nombre_de_la_tarea` y tus cambios se pasan a la rama nueva.
- **GitHub dice "rejected" al hacer push:** estás en `develop`. Crea tu rama (punto anterior).
- **GitHub dice que hay conflictos en mi Pull Request:** avisa al Scrum Master y lo resolvemos juntos.
- **No sé qué ha pasado:** no borres nada ni uses `--force`. Pregunta en el grupo.

## Reglas básicas

- Nunca subas el archivo `.env`, porque tiene contraseñas.
- Si instalas un paquete nuevo con npm, avisa al grupo.
- Los archivos que usamos todos (`app.js`, `package.json`, `views/layout.pug`, `public/css/style.css`, `models/movie.model.js`) no se tocan sin avisar.
