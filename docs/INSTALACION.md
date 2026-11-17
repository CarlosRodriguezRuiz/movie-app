# 🛠️ Guía de instalación paso a paso

Esta guía explica, punto por punto, la tarjeta **«🛠️ Setup del entorno»** de Trello. Síguela en orden. Si algo falla, mira el apartado **🆘 Si algo falla** del final, y si no lo ves ahí, escríbelo en un comentario de tu tarjeta de Setup.

⏱️ Calcula **1 hora** la primera vez, sobre todo por la descarga e instalación de PostgreSQL y MongoDB.

---

## 0. Lo que tienes que tener antes

Abre una terminal y comprueba:

```bash
node -v
```
```bash
git --version
```

- **Node.js 20 o más.** Si no lo tienes, descarga la versión **LTS** en https://nodejs.org
- **Git.** Si no lo tienes: https://git-scm.com (en Windows instala también **Git Bash**).
- **VS Code:** https://code.visualstudio.com

> 💡 **¿Qué terminal uso?** En VS Code: menú **Terminal → New Terminal** (o `Ctrl + ñ`). En Windows, elige **Git Bash** en la flechita junto al `+` de la terminal: los comandos de esta guía funcionan igual que en Mac y Linux.

---

## 1. Aceptar las invitaciones

- **GitHub:** te llega un email de GitHub. Si no lo encuentras, entra en https://github.com/notifications o en el enlace del repo y acepta la invitación.
- **Trello:** te llega otro email. Al aceptarlo verás el tablero **Movie App · Scrum**.

**Comprueba que el Scrum Master te ha invitado antes de seguir** (por eso tu tarjeta tiene el aviso ⛔).

---

## 2. Descargar el proyecto

Ve a la carpeta donde guardas tus ejercicios (por ejemplo `cd Documents/Bootcamp`) y escribe:

```bash
git clone https://github.com/CarlosRodriguezRuiz/movie-app.git
```
```bash
cd movie-app
```
```bash
npm install
```

- `git clone` descarga el proyecto en una carpeta nueva llamada **movie-app**.
- `cd movie-app` entra en ella. **Todos los comandos siguientes se escriben aquí dentro.**
- `npm install` descarga las librerías (Express, Pug, etc.) en la carpeta `node_modules`. Tarda un poco.

Abre el proyecto en VS Code con `code .` (o *File → Open Folder* → movie-app).

Comprueba que estás en la rama **develop**:
```bash
git branch
```
Debe salir `* develop`.

---

## 3. PostgreSQL (usuarios y favoritos)

### Instalarlo (si no lo tienes)
- **Windows:** descarga el instalador en https://www.postgresql.org/download/windows/ (botón *Download the installer*). Dale a *Siguiente* en todo, y:
  - Cuando te pida una **contraseña para el usuario `postgres`**, pon una y **apúntala**: la necesitarás en el `.env`.
  - Deja el puerto **5432**.
  - Deja marcado **pgAdmin 4** (es el programa para ver la base de datos).
- **Mac:** instala https://postgresapp.com y pgAdmin desde https://www.pgadmin.org

### Crear la base de datos
1. Abre **pgAdmin 4**.
2. En la izquierda: **Servers → PostgreSQL** (te pide la contraseña que apuntaste).
3. Clic derecho en **Databases → Create → Database…**
4. En *Database* escribe `movie_app` → **Save**.

> También vale abrir *Query Tool* y ejecutar: `CREATE DATABASE movie_app;`

**Solo creas la base de datos vacía.** Las tablas las crea el proyecto en el paso 7.

---

## 4. MongoDB (películas del admin)

Elige **una** de las dos opciones.

### Opción A: MongoDB en tu ordenador
1. Descarga **MongoDB Community Server** en https://www.mongodb.com/try/download/community
2. Instálalo con las opciones por defecto (**Complete**) y deja marcado **Install MongoDB as a Service** y **MongoDB Compass**.
3. Abre **MongoDB Compass** y pulsa **Connect** con `mongodb://127.0.0.1:27017`. Si conecta, ya está.

Tu `MONGO_URI` será:
```
MONGO_URI=mongodb://127.0.0.1:27017/movie_app
```

### Opción B: MongoDB Atlas (en la nube, gratis)
1. Crea una cuenta en https://www.mongodb.com/cloud/atlas
2. Crea un cluster **gratis (M0)**.
3. **Database Access** → *Add New Database User* → usuario y contraseña (apúntalos).
4. **Network Access** → *Add IP Address* → *Allow access from anywhere* (`0.0.0.0/0`). Solo para desarrollo.
5. **Connect → Drivers** → copia la dirección. Es parecida a:
   ```
   mongodb+srv://USUARIO:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Cambia `<password>` por tu contraseña y añade **`movie_app`** justo antes del `?`:
   ```
   MONGO_URI=mongodb+srv://USUARIO:TUCONTRASEÑA@cluster0.xxxxx.mongodb.net/movie_app?retryWrites=true&w=majority
   ```

---

## 5. Tu API key de OMDB

1. Entra en http://www.omdbapi.com/apikey.aspx
2. Elige **FREE (1.000 peticiones al día)**, pon tu email y envía.
3. Te llega un email con la key **y un enlace de activación. Hay que pulsarlo**, si no, la key no funciona.
4. Pruébala pegando esto en el navegador (con tu key):
   ```
   https://www.omdbapi.com/?apikey=TUKEY&s=star wars
   ```
   Si ves un JSON con películas, funciona.

---

## 6. Crear tu archivo `.env`

El `.env` guarda tus contraseñas. **Cada uno tiene el suyo y nunca se sube a GitHub** (ya está en el `.gitignore`).

1. Copia `.env.example` y llámalo `.env`:
   ```bash
   cp .env.example .env
   ```
   (o en VS Code: clic derecho en `.env.example` → *Copy* → *Paste* → renómbralo a `.env`)
2. Ábrelo y rellena:

```
# PostgreSQL
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=la_contraseña_que_apuntaste_en_el_paso_3
PGDATABASE=movie_app

# MongoDB (la del paso 4)
MONGO_URI=mongodb://127.0.0.1:27017/movie_app

# OMDB (la del paso 5)
OMDB_API_KEY=tu_key

# JWT: inventa una frase larga cualquiera (no es una contraseña tuya)
JWT_SECRET=mi_frase_secreta_super_larga_para_el_bootcamp

# Google: déjalo vacío (lo configura P1 más adelante)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

3. Comprueba que Git **no** lo va a subir:
   ```bash
   git status
   ```
   El `.env` **no** debe aparecer en la lista.

---

## 7. Crear las tablas y los usuarios de prueba

```bash
npm run db:init
```

Debe decir:
```
✅ schema.sql ejecutado
✅ seed.sql ejecutado
```

Crea las tablas `users` y `favorites`, y dos usuarios de prueba: `user@test.com` y `admin@test.com` (contraseña `123456`). Puedes verlos en pgAdmin: *movie_app → Schemas → public → Tables → users* → clic derecho → *View/Edit Data*.

> ⚠️ `db:init` **borra y vuelve a crear** las tablas. Úsalo al principio o cuando quieras empezar de cero.

---

## 8. Pasar los tests

```bash
npm test
```

Al final debe salir **`Tests: 24 passed, 24 total`**. Los tests no usan la base de datos, así que deberían pasar aunque algo de lo anterior falle.

---

## 9. Arrancar la app

```bash
npm run dev
```

En la terminal tienes que ver:
```
✅ PostgreSQL conectado
✅ MongoDB conectado
🎬 Movie App en http://localhost:3000
📚 Swagger en http://localhost:3000/api-docs
```

Abre http://localhost:3000: debe salir la página de login.

- La app se **reinicia sola** cada vez que guardas un archivo (es `nodemon`). Solo tienes que recargar el navegador.
- Para pararla: `Ctrl + C` en la terminal.

> ℹ️ **Es normal que el login todavía no funcione.** Si pruebas a entrar, sale `pendiente de implementar`: el login lo programa P1 en el Sprint 1. Para entrar mientras tanto, usa el paso 10.

---

## 10. Entrar sin login (atajo de desarrollo)

- http://localhost:3000/dev/login/user → entras como **usuario** (te lleva a `/dashboard`).
- http://localhost:3000/dev/login/admin → entras como **admin** (te lleva a `/movies`).

Las páginas salen casi vacías: es justo lo que tenemos que programar entre los tres.

---

## 11. Ver la documentación de la API

Abre http://localhost:3000/api-docs. Es **Swagger**: la lista de todos los endpoints de la API. Cada uno documentará aquí los suyos.

---

## 12. Leer la documentación del equipo

- **README.md:** qué es el proyecto y cómo arrancarlo.
- **CONTRIBUTING.md:** cómo trabajamos con Git (ramas y Pull Requests).
- **Trello → 📌 Info y normas:** sobre todo «Cómo usar este tablero», «Guía de Git» y «Mapa de carpetas».
- **Tu PDF** (en tu tarjeta de **👤 Por persona**).

---

## 13. Extensiones de VS Code

En VS Code, icono de extensiones (`Ctrl + Shift + X`), busca e instala:

- **Prettier - Code formatter**: ordena el código al guardar, igual para los tres.
- **EditorConfig for VS Code**: usa la configuración del proyecto (espacios, saltos de línea).
- **Pug** (opcional): colores en los archivos `.pug`.

Para que Prettier formatee al guardar: `Ctrl + ,` → busca **Format On Save** → márcalo.

---

## ✅ ¿Ya está?

Si has llegado aquí con los 24 tests en verde y la app arrancada:

1. Marca todos los puntos de tu tarjeta **🛠️ Setup del entorno**.
2. Muévela directamente a **🎉 Hecho** (esta tarjeta no lleva Pull Request).
3. Avisa en el grupo y empieza por tu tarjeta número 2.

---

## 🆘 Si algo falla

- **`'node' / 'npm' no se reconoce como un comando`**: Node no está instalado, o hay que cerrar y volver a abrir la terminal (y VS Code) después de instalarlo.
- **En PowerShell sale `la ejecución de scripts está deshabilitada`** al usar `npm`: abre la terminal **Git Bash** o **Command Prompt** en VS Code y usa esa.
- **`npm install` da errores rojos**: comprueba que estás dentro de la carpeta `movie-app` (debe existir `package.json`) y vuelve a intentarlo. Los avisos amarillos (`WARN`) se pueden ignorar.
- **`client password must be a string`**: a PostgreSQL no le llega ninguna contraseña. Mira que el archivo se llama exactamente `.env` (no `.env.txt` ni `.env.example`), que la línea `PGPASSWORD=` tiene algo detrás y que lo has **guardado** (`Ctrl + S`).
- **`password authentication failed` / `la autentificación password falló para el usuario «postgres»`**: la contraseña de `PGPASSWORD` no es la de tu PostgreSQL. Revisa el `.env` (sin espacios ni comillas). Si **no recuerdas la contraseña**, mira la solución de abajo.

### 🔑 No recuerdo la contraseña de PostgreSQL

No se puede «ver», pero no hace falta: crea un **usuario solo para este proyecto**. Así no tocas tus otras bases de datos ni sus contraseñas.

1. En pgAdmin, clic en la base **movie_app** → botón **Query Tool**. Si pgAdmin entra sin pedirte contraseña, es que la tiene guardada.
2. Pega esto y ejecútalo con ▶ (o `F5`):
   ```sql
   CREATE ROLE movie_app_user WITH LOGIN PASSWORD 'movieapp123';
   ALTER DATABASE movie_app OWNER TO movie_app_user;
   ```
   Abajo, en **Messages**, debe salir *Query returned successfully*.
3. En tu `.env` cambia estas dos líneas y **guarda**:
   ```
   PGUSER=movie_app_user
   PGPASSWORD=movieapp123
   ```
4. Ejecuta `npm run db:init` y después `npm run dev`. Debe salir `✅ PostgreSQL conectado`.

> Si `CREATE ROLE` da `role "movie_app_user" already exists`, ya lo creaste antes: salta al paso 3.
- **`database "movie_app" does not exist`**: te falta el paso 3 (crear la base de datos en pgAdmin).
- **`connect ECONNREFUSED 127.0.0.1:5432`**: PostgreSQL no está arrancado. En Windows: tecla Windows → *Servicios* → busca **postgresql** → *Iniciar*.
- **`❌ MongoDB no disponible` / `ECONNREFUSED 127.0.0.1:27017`**: MongoDB no está arrancado. En Windows: *Servicios* → **MongoDB Server** → *Iniciar*.
- **Atlas: `bad auth` o `authentication failed`**: el usuario o la contraseña de `MONGO_URI` no son los de *Database Access* (no son los de tu cuenta de Atlas).
- **Atlas: se queda colgado o `timed out`**: falta añadir tu IP en *Network Access*.
- **OMDB devuelve `Invalid API key!`**: no has pulsado el enlace de activación del email.
- **`EADDRINUSE: address already in use :::3000`**: ya tienes la app abierta en otra terminal. Ciérrala con `Ctrl + C` (o cambia `PORT=3001` en el `.env`).
- **`secretOrPrivateKey must have a value`** al usar `/dev/login`: falta `JWT_SECRET` en el `.env`, o no has creado el `.env`.
- **Sale `pendiente de implementar`**: es normal, es una parte que todavía hay que programar.

¿No está tu error? Copia el mensaje completo de la terminal en un comentario de tu tarjeta de Setup y avisa en el grupo.
