import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/actions/Auth/AuthService';

const authService = new AuthService();

/**
 * RedirectMiddleware
 * If a user is already authenticated, redirect them to the correct dashboard.
 * Otherwise, allow them to see the login page.
 */
export const RedirectMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.auth_token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return next(); // No token → show login page
        }

        const decoded = await authService.verifyToken(token);

        if (decoded) {
            if (decoded.level === 1) {
                return res.redirect('/superadmin/dashboard');
            }
            if (decoded.level === 2) {
                return res.redirect('/admin/dashboard');
            }
            return res.redirect('/dashboard'); // fallback for other roles
        }

        next();
    } catch (error) {
        res.clearCookie('auth_token');
        next(); // Invalid token → show login page
    }
};
