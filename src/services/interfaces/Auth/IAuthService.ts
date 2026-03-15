import User from '../../../models/SuperAdmin/User.model';

export interface IAuthService {
    /**
     * Validates credentials and returns the user object with a signed JWT
     * @param email   - User's unique email address
     * @param pass    - Plain text password to be verified against hash
     * @param remember - If true, token expiry is extended to 30 days
     */
    login(email: string, pass: string, remember?: boolean): Promise<{ user: User; token: string }>;

    /**
     * Handles any server-side cleanup required for ending a session
     * @param userId - The ID of the user logging out
     */
    logout(userId: string): Promise<boolean>;

    /**
     * Verifies if a token is still valid and returns the payload
     * @param token - The JWT string from the client
     */
    verifyToken(token: string): Promise<any>;
}