import { Router } from 'express';
import { AuthController } from '../../controllers/Auth/AuthController';
import { authenticate } from '../../middleware/AuthMiddleware';

const router = Router();
const authController = new AuthController();

// --- PUBLIC ROUTES ---
router.post('/login', authController.login);

// --- AUTHENTICATION GATE ---
// Everything below this line is now strictly covered by the middleware
router.use(authenticate);

// --- PROTECTED ROUTES ---
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

export default router;