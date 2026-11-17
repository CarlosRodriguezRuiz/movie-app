/**
 * Punto de entrada: conecta las bases de datos y arranca el servidor.
 */
const app = require('./app');
const { pool } = require('./config/db.sql');
const { connectMongo } = require('./config/db.mongo');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL conectado');
  } catch (err) {
    console.error('❌ PostgreSQL no disponible:', err.message);
  }
  try {
    await connectMongo();
    console.log('✅ MongoDB conectado');
  } catch (err) {
    console.error('❌ MongoDB no disponible:', err.message);
  }
  app.listen(PORT, () => {
    console.log(`🎬 Movie App en http://localhost:${PORT}`);
    console.log(`📚 Swagger en http://localhost:${PORT}/api-docs`);
  });
};

start();
