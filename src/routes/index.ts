import { Router } from 'express';
import login from './public/login';
import auth from './auth/auth';
import superadminRoutes from './superadmin/index'; // 1. Import the sub-router 


const router = Router();


router.get('/', (req, res) => {
    res.send('Welcome to the Entry Point');
});

// Public Routes (No middleware needed)
router.use('/login', login);

// Protected Routes (Uses the auth folder/file we just fixed)
router.use('/auth', auth);
router.use('/superadmin', superadminRoutes);


// src/routes/index.ts (or your main router)

// SuperAdmin Landing Strip


// Admin Landing Strip
router.get('/admin/dashboard', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; padding: 20px;">
            <h1 style="color: darkblue;">Admin Area</h1>
            <p>Verification Success: You have reached Standard Admin Access.</p>
            <hr>
            <a href="/auth/logout">Logout</a>
        </div>
    `);
});

export default router;

