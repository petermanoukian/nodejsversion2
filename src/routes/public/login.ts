import { Router } from 'express';
import { RedirectMiddleware } from '../../middleware/RedirectMiddleware';

const router = Router();

// GET /login
router.get('/', RedirectMiddleware, (req, res) => {
    res.render('public/login');
});

export default router;

