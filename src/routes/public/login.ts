import { Router } from 'express';
// We don't even need the AuthController here if we are just loading a static page
const router = Router();

/**
 * GET /login
 * This loads the actual visual login page for the user
 */
router.get('/', (req, res) => {
    res.render('public/login');
});

export default router;