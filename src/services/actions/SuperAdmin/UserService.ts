import { IUserService } from '@service-interfaces/SuperAdmin/IUserService';
import { UserRepository } from '@repositories/SuperAdmin/UserRepository';
import User from '@models/SuperAdmin/User.model';
import bcrypt from 'bcryptjs';

export class UserService implements IUserService {
    private userRepository: UserRepository;

    constructor() {
        // We instantiate the specific SuperAdmin UserRepository here
        this.userRepository = new UserRepository();
    }

    // --- 5-Rule & 7-Rule operations (Many records) ---
    async fetchAllUsers(options: any): Promise<User[]> {
        // Business logic: You could filter out 'deleted' or 'archived' users by default here
        return await this.userRepository.getMany(options);
    }

    async fetchPaginatedUsers(options: any): Promise<{ rows: User[], count: number }> {
        return await this.userRepository.getManyPaginated(options);
    }

    // --- 3-Rule & 2-Rule operations (Single records) ---
    async findUserByFilter(options: any): Promise<User | null> {
        return await this.userRepository.getOneByFilter(options);
    }

    async findUserById(id: string, options?: any): Promise<User | null> {
        return await this.userRepository.getById(id, options);
    }

    // --- Mutations (The "Actions") ---
    async registerUser(data: any): Promise<User> {
        // Rule: Never store raw passwords.
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }
        
        // Rule: Ensure a default level if none is provided
        if (!data.level) {
            data.level = 2; 
        }

        return await this.userRepository.store(data);
    }

    async modifyUser(id: string, data: any): Promise<User | null> {
        // Rule: If password is being updated, it must be re-hashed
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }
        
        const [affectedCount, updatedRows] = await this.userRepository.update(id, data);
        return updatedRows.length > 0 ? updatedRows[0] : null;
    }

    async removeUser(id: string): Promise<boolean> {
        const deletedCount = await this.userRepository.delete(id);
        return deletedCount > 0;
    }

    async bulkRemoveUsers(filters: any): Promise<number> {
        // Principle of Safety: Prevent accidental total database wipe
        if (!filters || Object.keys(filters).length === 0) {
            throw new Error("Security Violation: Bulk delete attempted without filters.");
        }
        return await this.userRepository.deleteMany(filters);
    }
}