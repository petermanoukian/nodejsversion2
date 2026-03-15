import { Request, Response } from 'express';
import { AuthService } from '../../services/actions/Auth/AuthService';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password, remember } = req.body;

            if (!email || !password) {
                req.flash('error', 'Email and password are required.');
                res.redirect('/login');
                return;
            }

            const { user, token } = await this.authService.login(email, password, !!remember);

            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                // No maxAge = session cookie. With remember = 30 days.
                maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : undefined,
            });

            if (user.level === 1) {
                req.flash('success', `Welcome SuperAdmin: ${user.name}`);
                res.redirect('/superadmin/dashboard');
            } else {
                req.flash('success', `Welcome Admin: ${user.name}`);
                res.redirect('/admin/dashboard');
            }

        } catch (error: any) {
            req.flash('error', error.message || 'Invalid credentials.');
            res.redirect('/login');
        }
    };

    public logout = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.id;
            await this.authService.logout(userId);
        } catch {
            // Logout should never hard-fail — always clear and redirect
        } finally {
            res.clearCookie('auth_token');
            req.flash('success', 'You have been logged out.');
            res.redirect('/login');
        }
    };
}