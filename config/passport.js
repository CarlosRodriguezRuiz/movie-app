/**
 * Login con Google (OAuth 2.0). Responsable: Persona 1.
 * Google nos devuelve el perfil; buscamos el usuario por email y, si no existe, lo creamos.
 * @module config/passport
 */
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/user.model');

// Sin credenciales (por ejemplo en los tests) no se registra la estrategia
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();
        let user = await User.getByEmail(email);
        if (!user) {
          // Sin contraseña: solo podrá entrar con Google
          user = await User.create(profile.displayName, email, null, 'google');
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));
}

module.exports = passport;
