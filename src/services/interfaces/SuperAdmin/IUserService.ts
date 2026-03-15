import User from '../../../models/SuperAdmin/User.model';

export interface IUserService {
    // 5-Rule & 7-Rule operations
    fetchAllUsers(options: any): Promise<User[]>;
    fetchPaginatedUsers(options: any): Promise<{ rows: User[], count: number }>;

    // 3-Rule & 2-Rule operations
    findUserByFilter(options: any): Promise<User | null>;
    findUserById(id: string, options?: any): Promise<User | null>;

    // Mutations
    registerUser(data: any): Promise<User>;
    modifyUser(id: string, data: any): Promise<User | null>;
    removeUser(id: string): Promise<boolean>;
    bulkRemoveUsers(filters: any): Promise<number>;
}