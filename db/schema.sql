-- Esquema PostgreSQL: usuarios y favoritos.
-- Se ejecuta con: npm run db:init   (borra y recrea las tablas)

DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255),                          -- hash bcrypt; NULL si entra con OAuth
  role        VARCHAR(10)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  provider    VARCHAR(20)  NOT NULL DEFAULT 'local', -- 'local' | 'google'
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Solo la RELACIÓN usuario <-> película. Los datos de la película viven en OMDB o en MongoDB.
CREATE TABLE favorites (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id    VARCHAR(50) NOT NULL,                  -- imdbID (OMDB) o _id (MongoDB)
  source      VARCHAR(10) NOT NULL CHECK (source IN ('omdb', 'mongo')),
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, movie_id, source)
);
