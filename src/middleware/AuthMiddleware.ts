import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/actions/Auth/AuthService';

const authService = new AuthService();

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Check Cookies first (for Web/Redirects), then fallback to Headers (for API)
        const token = req.cookies.auth_token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            // If it's a web request (has no 'application/json' accept header), redirect to login
            if (req.accepts('html')) {
                req.flash('error', 'Please log in to access this page.');
                return res.redirect('/login');
            }
            return res.status(401).json({ success: false, message: 'No authority token provided.' });
        }

        const decoded = await authService.verifyToken(token);

        // Attach user to request
        (req as any).user = decoded;

        next();
    } catch (error: any) {
        res.clearCookie('auth_token');
        if (req.accepts('html')) {
            req.flash('error', 'Session invalid or expired.');
            return res.redirect('/login');
        }
        res.status(401).json({ success: false, message: 'Session invalid or expired.' });
    }
};