import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/actions/Auth/AuthService';

const authService = new AuthService();

export const isSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Check Cookies first (for Web/Redirects), then fallback to Headers (for API)
        const token = req.cookies.auth_token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            if (req.accepts('html')) {
                req.flash('error', 'Please log in to access this page.');
                return res.redirect('/login');
            }
            return res.status(401).json({ success: false, message: 'No authority token provided.' });
        }

        const decoded = await authService.verifyToken(token);

        // 2. Verify Authorization (Is the user Level 1?)
        if (decoded && decoded.level === 1) {
            (req as any).user = decoded;
            return next();
        }

        // If level is not 1, deny access
        if (req.accepts('html')) {
            req.flash('error', 'Access denied: Insufficient clearance.');
            return res.redirect('/dashboard'); // or wherever unauthorized users should go
        }
        return res.status(403).json({ 
            success: false, 
            message: 'Forbidden: Insufficient clearance for the Private Section.' 
        });

    } catch (error: any) {
        res.clearCookie('auth_token');
        if (req.accepts('html')) {
            req.flash('error', 'Session invalid or expired.');
            return res.redirect('/login');
        }
        res.status(401).json({ success: false, message: 'Session invalid or expired.' });
    }
};