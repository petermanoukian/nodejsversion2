import { db } from './models/index';
import bcrypt from 'bcryptjs';

async function createFirstAdmin() {
    const User = db.User;
    const hashedPassword = await bcrypt.hash('12345678', 10);

    try {
        const admin = await User.create({
            name: 'Admin',
            email: 'super@super.com',
            password: hashedPassword,
            level: 1 // High Command Level
        });
        console.log('SuperAdmin Created Successfully:', admin.email);
    } catch (error) {
        console.error('Seed failed:', error);
    }
}

createFirstAdmin();