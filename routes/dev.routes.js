/**
 * SOLO DESARROLLO: entrar sin login real mientras la Persona 1 termina el login.
 *   http://localhost:3000/dev/login/user   -> entra como usuario de prueba (id 1)
 *   http://localhost:3000/dev/login/admin  -> entra como admin de prueba (id 2)
 * Los usuarios de prueba se crean con `npm run db:init` (db/seed.sql).
 * No se monta si NODE_ENV=production. Borrar antes de la entrega.
 */
const router = require('express').Router();
const { signToken } = require('../middlewares/auth.middleware');

const fakeUsers = {
  user: { id: 1, name: 'Usuario Prueba', email: 'user@test.com', role: 'user' },
  admin: { id: 2, name: 'Admin Prueba', email: 'admin@test.com', role: 'admin' },
};

router.get('/dev/login/:role', (req, res) => {
  const user = fakeUsers[req.params.role];
  if (!user) return res.status(400).send('Usa /dev/login/user o /dev/login/admin');
  res.cookie('token', signToken(user), { httpOnly: true });
  return res.redirect(user.role === 'admin' ? '/movies' : '/dashboard');
});

module.exports = router;
