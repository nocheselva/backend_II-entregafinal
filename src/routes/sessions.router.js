import { Router } from 'express';
import passport from 'passport';
import { SessionsController } from '../controllers/sessions.controller.js';

const router = Router();
const sessionsController = new SessionsController();

// Custom Middleware para formatear las respuestas de error de Passport
const customAuthenticate = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(strategy === 'register' ? 400 : 401).json({
          status: 'error',
          message: info?.message || 'Error de autenticación'
        });
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

// Rutas centralizadas con Passport
router.post('/register', customAuthenticate('register'), sessionsController.register);
router.post('/login', customAuthenticate('login'), sessionsController.login);
router.get('/current', customAuthenticate('current'), sessionsController.current);
router.post('/logout', sessionsController.logout);

export default router;

// POST /api/sessions/logout
router.post('/logout', (req, res) => {
  res.clearCookie('currentUser'); // Nombre de tu cookie JWT
  return res.status(200).json({ status: 'success', message: 'Sesión cerrada correctamente' });
});