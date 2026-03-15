import { IAuthService } from '../../interfaces/Auth/IAuthService';
import User from '../../../models/SuperAdmin/User.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService implements IAuthService {
    private readonly jwtSecret: string;

    constructor() {
        if (!process.env.JWT_SECRET) {
            throw new Error('[AuthService] JWT_SECRET is not defined in environment variables.');
        }
        this.jwtSecret = process.env.JWT_SECRET;
    }

    public async login(
        email: string,
        pass: string,
        remember: boolean = false
    ): Promise<{ user: User; token: string }> {

        // Fetch by email — direct model import, no db.User
         console.log('started.');
        const user = await User.findOne({ where: { email } });

        console.log('[AuthService.login] Query complete.');
        console.log('[AuthService.login] Raw user object:', JSON.stringify(user, null, 2));

        console.log('[AuthService.login] user.name:', user?.name);
        console.log('[AuthService.login] user.email:', user?.email);
        console.log('[AuthService.login] user.level:', user?.level);
        console.log('[AuthService.login] user.dataValues:', user?.dataValues);



        if (!user) {
            throw new Error('Line 38 Invalid credentials provided.');
        }

        if (!user.password) {
            throw new Error('LINE 42 Internal authentication error.');
        }

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials provided Line 47.');
        }

        const token = jwt.sign(
            { id: user.id, level: user.level },
            this.jwtSecret,
            { expiresIn: remember ? '30d' : '8h' }
        );

        return { user, token };
    }

    public async logout(userId: string): Promise<boolean> {
        // Stateless JWT — nothing to invalidate server-side yet
        // Hook in a token blacklist or Redis here later if needed
        return true;
    }

    public async verifyToken(token: string): Promise<any> {
        // jwt.verify throws if invalid — let it bubble up to the caller
        return jwt.verify(token, this.jwtSecret);
    }
}