/**
 * Recoge los errores de express-validator y responde 400 si los hay.
 * Uso: router.post('/', [body('email').isEmail()], validate, controller.create)
 * @module middlewares/validation
 */
const { validationResult } = require('express-validator');

/** @type {import('express').RequestHandler} */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

module.exports = { validate };
